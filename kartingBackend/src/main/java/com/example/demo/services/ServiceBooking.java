package com.example.demo.services;

import com.example.demo.entities.EntityBooking;
import com.example.demo.entities.EntityClient;
import com.example.demo.repositories.RepoBooking;
import com.example.demo.repositories.RepoClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class ServiceBooking {
    @Autowired
    RepoBooking repoBooking;
    @Autowired
    RepoClient repoClient;

    ServiceVoucher serviceVoucher;

    /**
     * Método para guardar una reserva
     * @param booking Objeto de tipo EntityBooking
     *
     */
    public Boolean saveBooking(EntityBooking booking) {
        // Definir precios y duración
        int basePrice, totalDurationReservation;

        // Calcular precio base y duración total según el número de vueltas o tiempo máximo permitido
        switch (booking.getLapsOrMaxTimeAllowed()) {
            case 10 -> { basePrice = 15000; totalDurationReservation = 30; }
            case 15 -> { basePrice = 20000; totalDurationReservation = 35; }
            case 20 -> { basePrice = 25000; totalDurationReservation = 40; }
            default -> {
                System.out.println("Valor inválido para lapsOrMaxTimeAllowed.");
                return false;
            }
        }
        booking.setPrice(String.valueOf(basePrice));

        String[] clientsRUT = booking.getClientsRUT().split(",");

        if (!validateBookingFields(booking, totalDurationReservation) || !validateClientWhoMadeReservation(clientsRUT)) {
            return false;
        }

        // Calcular precio final con descuentos
        String discountsList = discountsApplied(clientsRUT, booking, repoClient);
        String totalPrice = totalPriceWithDiscount(basePrice, discountsList);
        booking.setTotalPrice(totalPrice);

        // Calcular el total con IVA
        String totalWithIva = calculateTotalWithIva(booking.getTotalPrice(), booking.getIva());
        booking.setTotalWithIva(totalWithIva);

        // Calcular el monto total a pagar
        booking.setTotalAmount(calculateTotalPrice(totalWithIva));

        booking.setBookingStatus("sin confirmar");
        repoBooking.save(booking);
        return true;
    }

    /**
     * Método para verificar que los campos de la reserva se han completado
     */
    public Boolean validateBookingFields(EntityBooking booking, int totalDurationReservation) {
        // Verificar que los campos no estén vacíos
        if (booking.getBookingDate() == null || booking.getBookingTime() == null ||
                booking.getLapsOrMaxTimeAllowed() == null || booking.getNumOfPeople() == null ||
                booking.getClientsRUT().isEmpty() || booking.getClientsNames().isEmpty() ||
                booking.getClientsEmails().isEmpty()) {
            System.out.println("Los campos de la reserva no pueden estar vacíos.");
            return false;
        }

        // Verificar que la cantidad de personas esté en el rango permitido
        if (booking.getNumOfPeople() < 1 || booking.getNumOfPeople() > 15) {
            System.out.println("Número de personas fuera de rango (1-15).");
            return false;
        }

        // Verificar que la fecha y hora no se encuentre reservada
        if (!isBookingTimeValid(booking, totalDurationReservation, repoBooking)) {
            System.out.println("Fecha u hora de reserva inválida.");
            return false;
        }

        System.out.println("Reserva válida.");
        return true;
    }

    /**
     * Método para validar la fecha y hora de reserva
     * @param booking objeto de tipo EntityBooking
     * @param repoBooking repositorio de reservas
     * @return true si la reserva es válida, false en caso contrario
     */
    public boolean isBookingTimeValid(EntityBooking booking, int totalDurationReservation, RepoBooking repoBooking) {
        LocalDate bookingDate = booking.getBookingDate();
        LocalTime bookingTime = booking.getBookingTime();

        // Calcular la hora de término de la nueva reserva
        LocalTime newBookingTimeEnd = bookingTime.plusMinutes(totalDurationReservation);

        // Obtener todas las reservas del mismo día
        List<EntityBooking> existingBookings = repoBooking.findByBookingDate(bookingDate);

        if (existingBookings != null) {
            for (EntityBooking existingBooking : existingBookings) {
                LocalTime existingBookingTime = existingBooking.getBookingTime();
                LocalTime existingBookingTimeEnd = existingBooking.getBookingTimeEnd();

                // Comprobar si hay solapamiento de horarios
                if (!newBookingTimeEnd.isBefore(existingBookingTime) && !bookingTime.isAfter(existingBookingTimeEnd)) {
                    System.out.println("La hora de reserva se superpone con una reserva existente.");
                    return false;
                }
            }
        }
        booking.setBookingTimeEnd(newBookingTimeEnd);
        System.out.println("La hora de reserva es válida.");
        return true;
    }

    /**
     * Método para verificar si la fecha es un feriado
     * @param date Fecha a verificar
     * @return true si es feriado, false en caso contrario
     */
    public boolean checkIfHoliday(LocalDate date) {
        List<String> holidays = List.of("01-01", "01-05", "18-09", "19-09", "25-12"); // Feriados irrenunciables
        String formattedDate = date.format(DateTimeFormatter.ofPattern("dd-MM"));
        return holidays.contains(formattedDate);
    }

    /**
     * Método para verificar que el usuario que realiza la reserva, está registrado
     * @param clientRuts lista de RUTs de los clientes
     * @return true si el cliente está registrado, false en caso contrario
     */
    public Boolean validateClientWhoMadeReservation(String[] clientRuts) {
        // Verificar si la lista no está vacía
        if (clientRuts == null || clientRuts.length == 0) {
            System.out.println("La lista de RUTs está vacía.");
            return false;
        }

        EntityClient client = repoClient.findByClientRUT(Arrays.stream(clientRuts).toList().get(0));

        // Validar que el cliente existe antes de acceder a sus datos
        if (client == null) {
            System.out.println("El cliente principal no está registrado.");
            return false;
        }
        System.out.println("El cliente principal está registrado: " + client.getClientName());
        return true;
    }

    /**
     * Método para aplicar los descuentos a los clientes registrados según corresponda
     * @param clientRuts lista de RUTs de los clientes
     * @param booking objeto de tipo EntityBooking
     * @param repoClient repositorio de clientes
     * @return lista de descuentos aplicados a cada cliente
     */
    public String discountsApplied(String[] clientRuts, EntityBooking booking, RepoClient repoClient){
        String bookingDayMonth = booking.getBookingDate().format(DateTimeFormatter.ofPattern("dd-MM"));
        Integer numOfPeople = booking.getNumOfPeople();
        StringBuilder discountsList = new StringBuilder();
        StringBuilder discountsListType = new StringBuilder();
        int discount;

        if (1 == numOfPeople || numOfPeople == 2) {
            for (String rut : clientRuts) {
                EntityClient client = repoClient.findByClientRUT(rut);
                if (client != null) {
                    Integer visitsPerMonth = client.getVisistsPerMonth();
                    discount = (2 <= visitsPerMonth && visitsPerMonth <= 4) ? 10
                            : (5 == visitsPerMonth || visitsPerMonth == 6) ? 20
                            : (visitsPerMonth >= 7) ? 30
                            : 0;
                    if(discount == 0){
                        discountsListType.append("no,");
                    } else{
                        discountsListType.append("visitas,");
                    }
                    client.setVisistsPerMonth(visitsPerMonth + 1);

                } else {
                    discount = 0; // Si el cliente no está registrado, no se aplica descuento
                    discountsListType.append("no,");
                }
                discountsList.append(discount).append(",");
            }
        }
        if (3 <= numOfPeople && numOfPeople <= 5) {
            int bDayDiscountApplied = 0;
            for (String rut : clientRuts) {
                EntityClient client = repoClient.findByClientRUT(rut);
                if (client != null) {
                    Integer visitsPerMonth = client.getVisistsPerMonth();
                    String clientBirthday = client.getClientBirthday();
                    if (bDayDiscountApplied == 0 && clientBirthday != null && clientBirthday.substring(0, 5).equals(bookingDayMonth)) {
                        discount = 50;
                        bDayDiscountApplied = 1;
                        discountsListType.append("cumpleaños,");
                    } else {
                        discount = (5 == visitsPerMonth || visitsPerMonth == 6) ? 20
                                : (visitsPerMonth >= 7) ? 30
                                : 10; // Descuento por grupo de 3 a 5 personas
                        if (discount == 10) {
                            discountsListType.append("integrantes,");
                        }else {
                            discountsListType.append("visitas,");
                        }
                    }
                    client.setVisistsPerMonth(visitsPerMonth + 1);
                } else {
                    discount = 0; // Si el cliente no está registrado, no se aplica descuento
                    discountsListType.append("no,");
                }
                discountsList.append(discount).append(",");
            }
        }
        if (6 <= numOfPeople && numOfPeople <= 10) {
            int bDayDiscountApplied = 0;
            for (String rut : clientRuts) {
                EntityClient client = repoClient.findByClientRUT(rut);
                if (client != null) {
                    Integer visitsPerMonth = client.getVisistsPerMonth();
                    String clientBirthday = client.getClientBirthday();
                    if (bDayDiscountApplied < 3 && clientBirthday != null && clientBirthday.substring(0, 5).equals(bookingDayMonth)) {
                        discount = 50;
                        bDayDiscountApplied += 1;
                        discountsListType.append("cumpleaños,");
                    } else {
                        discount = (visitsPerMonth >= 7) ? 30
                                : 20; // Descuento por el grupo de 6 a 10 personas
                        if (discount == 20) {
                            discountsListType.append("integrantes,");
                        }else {
                            discountsListType.append("visitas,");
                        }
                    }
                    client.setVisistsPerMonth(visitsPerMonth + 1);
                } else {
                    discount = 0; // Si el cliente no está registrado, no se aplica descuento
                    discountsListType.append("no,");
                }
                discountsList.append(discount).append(",");
            }
        }
        if (11 <= numOfPeople && numOfPeople <= 15) {
            for (String rut : clientRuts) {
                EntityClient client = repoClient.findByClientRUT(rut);
                if (client != null) {
                    Integer visitsPerMonth = client.getVisistsPerMonth();
                    discount = 30; // Descuento por grupo de 11 a 15 personas
                    client.setVisistsPerMonth(visitsPerMonth + 1);
                    discountsListType.append("integrantes,");
                } else {
                    discount = 0; // Si el cliente no está registrado, no se aplica descuento
                    discountsListType.append("no,");
                }
                discountsList.append(discount).append(",");
            }
        }
        // Guardar los nombres de los descuentos aplicados en la reserva
        booking.setDiscounts(discountsListType.toString());
        // Convertir cada Integer a String
        return discountsList.toString();
    }

    /**
     * Método para calcular el precio total a pagar por cada cliente
     * @param basePrice precio base de la reserva
     * @param discountsList lista de descuentos aplicados a cada cliente
     * @return precio total a pagar por cada cliente
     */
    public String totalPriceWithDiscount(Integer basePrice, String discountsList){
        StringBuilder totalPrice = new StringBuilder();
        for (String discount : discountsList.split(",")) {
            Integer discountValue = Integer.parseInt(discount);
            Integer priceWithDiscount = basePrice - ((basePrice * discountValue) / 100);
            totalPrice.append(priceWithDiscount).append(",");
            System.out.println("Precio total a pagar por el cliente: " + totalPrice);
        }
        return totalPrice.toString();
    }

    /**
     * Método para calcular el precio total con IVA
     * @param totalPrice precio total a pagar por cada cliente
     * @param iva porcentaje de IVA
     * @return precio total con IVA
     */
    public String calculateTotalWithIva(String totalPrice, String iva) {
        Integer ivaI = Integer.parseInt(iva);
        List<String> totalPriceList = List.of(totalPrice.split(","));
        StringBuilder totalWithIva = new StringBuilder();
        for (String total : totalPriceList) {
            Integer price = Integer.parseInt(total); // Cambio a Double.parseDouble
            System.out.println("Precio base: " + price);
            Integer totalWithIvaValue = price + ((price * ivaI) / 100);
            System.out.println("Precio total con IVA: " + totalWithIvaValue);
            totalWithIva.append(totalWithIvaValue).append(",");
        }
        if (totalWithIva.length() > 0) {
            totalWithIva.setLength(totalWithIva.length() - 1); // Elimina la última coma
        }
        return totalWithIva.toString();
    }

    /**
     * Método para calcular el precio total a pagar
     * @param totalWithIva precio total con IVA
     * @return precio total a pagar
     */
    public Integer calculateTotalPrice(String totalWithIva) {
        Integer totalPrice = 0;
        List<String> totalWithIvaList = List.of(totalWithIva.split(","));
        for (String total : totalWithIvaList) {
            Integer price = Integer.parseInt(total);
            totalPrice += price;
        }
        return totalPrice;
    }

    /**
     * Método para confirmar una reserva
     * @param bookingId id de la reserva
     */
    public void confirmBooking(Long bookingId) {
        EntityBooking booking = repoBooking.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada con ID: " + bookingId));
        booking.setBookingStatus("confirmada");
        repoBooking.save(booking);
    }

    /**
     * Método para cancelar una reserva
     * @param bookingId id de la reserva
     */
    public void cancelBooking(Long bookingId) {
        EntityBooking booking = repoBooking.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada con ID: " + bookingId));
        booking.setBookingStatus("cancelada");
        repoBooking.save(booking);
    }

    /**
     * Método para obtener una lista de reservas de un cliente
     * @param rut RUT del cliente
     * @return lista de reservas
     */
    public List<EntityBooking> getBookingsByUserRut(String rut) {
        List<EntityBooking> bookings = repoBooking.findByClientsRUTContains(rut);
        List<EntityBooking> filteredBookings = new ArrayList<>();

        if (bookings.isEmpty()) {
            System.out.println("No se encontraron reservas para el cliente con RUT: " + rut);
            return new ArrayList<>();
        } else {
            for (EntityBooking booking : bookings) {
                // Verificar si el RUT del cliente coincide con el RUT de la reserva
                List<String> clientsRUT = List.of(booking.getClientsRUT().split(","));
                if (clientsRUT.get(0).equals(rut)) {
                    filteredBookings.add(booking);
                }
            }
        }
        return filteredBookings;
    }

    /**
     * Método para obtener una lista de reservas
     * @return lista de reservas
     */
    public List<EntityBooking> getBookings() {
        return repoBooking.findByBookingStatusContains("confirmada");
    }

    /**
     * Método para obtener una lista de reservas por fecha
     * @param date fecha de la reserva
     * @return lista de horas de reserva
     */
    public List<LocalTime> getTimesByDate(LocalDate date){
        List<EntityBooking> bookings = repoBooking.findByBookingDate(date);
        List<LocalTime> times = new ArrayList<>();
        for (EntityBooking booking : bookings) {
            times.add(booking.getBookingTime());
        }
        return times;
    }

    /**
     * Método para obtener una lista de reservas por fecha
     * @param date fecha de la reserva
     * @return lista de horas de reserva
     */
    public List<LocalTime> getTimesEndByDate(LocalDate date){
        List<EntityBooking> bookings = repoBooking.findByBookingDate(date);
        List<LocalTime> times = new ArrayList<>();
        for (EntityBooking booking : bookings) {
            times.add(booking.getBookingTimeEnd());
        }
        return times;
    }

    /**
     * Método para obtener una lista de reservas confirmadas
     */
    public List<EntityBooking> getConfirmedBookings() {
        return repoBooking.findByBookingStatusContains("confirmada");
    }

    /**
     * Método para obtener una lista de ingresos por mes según número de vueltas
     * [10, valor1, valor2, valor3, valor4, valor5, . . ., valor12, total]
     * @param lapsOrTimeMax número de vueltas o tiempo máximo
     * @return lista de ingresos por mes
     */
    public List<Integer> getIncomesForMonthOfLaps(Integer lapsOrTimeMax) {
        List<Integer> incomes = new ArrayList<>();
        Integer totalIncomes = 0;
        incomes.add(lapsOrTimeMax);
        for (int month = 1; month <= 12; month++) {
            String monthString = String.format("%02d", month);
            System.out.println("Mes: " + monthString);//
            Integer income = getIncomesForTimeAndMonth(lapsOrTimeMax, monthString);
            totalIncomes += income;
            incomes.add(income);
        }
        incomes.add(totalIncomes);
        return incomes;
    }

    /**
     * Método para sumar los ingresos totales de un mes según número de vueltas
     * @param lapsOrTimeMax número de vueltas o tiempo máximo
     * @param month mes de la reserva
     * @return ingresos totales
     */
    public Integer getIncomesForTimeAndMonth(Integer lapsOrTimeMax, String month) {
        System.out.println("Mes: " + month);
        List<EntityBooking> bookings = repoBooking.findByStatusAndDayAndLapsOrMaxTime("confirmada", month, lapsOrTimeMax);
        Integer incomes = 0;
        for (EntityBooking booking : bookings) {
            Integer numOfPeople = booking.getNumOfPeople();
            Integer price = Integer.parseInt(booking.getPrice());
            incomes += (price * numOfPeople);
        }
        return incomes;
    }

    /**
     * Método para sumar los ingresos totales de un mes
     * @return lista de ingresos totales
     */
    public List<Integer> getIncomesForLapsOfMonth(){
        List<Integer> totalIncomes = new ArrayList<>();
        for (int i = 1; i <= 12; i++){
            Integer value1 = getIncomesForMonthOfLaps(10).get(i);
            Integer value2 = getIncomesForMonthOfLaps(15).get(i);
            Integer value3 = getIncomesForMonthOfLaps(20).get(i);
            totalIncomes.add(value1 + value2 + value3);
        }
        Integer value1 = getIncomesForMonthOfLaps(10).get(13);
        Integer value2 = getIncomesForMonthOfLaps(15).get(13);
        Integer value3 = getIncomesForMonthOfLaps(20).get(13);
        totalIncomes.add(value1 + value2 + value3);
        return totalIncomes;
    }

    /**
     * Método para calcular ingresos por número de vueltas o tiempo máximo
     *
     */

}