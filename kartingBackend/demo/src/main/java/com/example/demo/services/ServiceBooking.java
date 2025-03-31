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
import java.util.Arrays;
import java.util.List;

@Service
public class ServiceBooking {
    @Autowired
    RepoBooking repoBooking;
    @Autowired
    RepoClient repoClient;

    /**
     * Método para guardar una reserva
     * @param booking Objeto de tipo EntityBooking
     *
     */
    public void saveBooking(EntityBooking booking) {
        String[] clientsRUT = booking.getClientsRUT().split(",");
        if (!validateBookingFields(booking) || !validateClientWhoMadeReservation(clientsRUT)) {
            return;
        }

        // Definir precios y duración
        int basePrice, totalDurationReservation;

        // Calcular precio base y duración total según el número de vueltas o tiempo máximo permitido
        switch (booking.getLapsOrMaxTimeAllowed()) {
            case 10 -> { basePrice = 15000; totalDurationReservation = 30; }
            case 15 -> { basePrice = 20000; totalDurationReservation = 35; }
            case 20 -> { basePrice = 25000; totalDurationReservation = 40; }
            default -> {
                System.out.println("Valor inválido para lapsOrMaxTimeAllowed.");
                return;
            }
        }

        // Calcular precio final con descuentos
        String discountsList = discountsAplied(clientsRUT, booking, repoClient);
        String totalPrice = totalPriceWithDiscount(basePrice, discountsList);

        // Calcular hora de término
        booking.setTotalPrice(totalPrice);
        booking.setBookingTimeEnd(booking.getBookingTime().plusMinutes(totalDurationReservation));

        repoBooking.save(booking);
    }

    /**
     * Método para verificar que los campos de la reserva se han completado
     */
    public Boolean validateBookingFields(EntityBooking booking) {
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
        if (!isBookingTimeValid(booking.getBookingDate(), booking.getBookingTime(), repoBooking)) {
            System.out.println("Fecha u hora de reserva inválida.");
            return false;
        }

        System.out.println("Reserva válida.");
        return true;
    }

    /**
     * Método para validar la fecha y hora de reserva
     * @param bookingDate fecha de la reserva
     * @param bookingTime hora de la reserva
     * @param repoBooking repositorio de reservas
     * @return true si la reserva es válida, false en caso contrario
     */
    public boolean isBookingTimeValid(LocalDate bookingDate, LocalTime bookingTime, RepoBooking repoBooking) {
        LocalTime openingTime = (checkIfHoliday(bookingDate)) ? LocalTime.of(10, 0) : LocalTime.of(14, 0);
        if (bookingTime.isBefore(openingTime) || bookingTime.isAfter(LocalTime.of(22, 0))) {
            return false;
        }
        return repoBooking.findByBookingDateAndBookingTime(bookingDate, bookingTime).isEmpty();

        // TO DO: verificar que la hora ingresada no se encuentre dentro del bloque horario de otra reserva
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
     * Método para aplicar los descuentos a los clietnes registrados según corresponda
     * @param clientRuts lista de RUTs de los clientes
     * @param booking objeto de tipo EntityBooking
     * @param repoClient repositorio de clientes
     * @return lista de descuentos aplicados a cada cliente
     */
    public String discountsAplied(String[] clientRuts, EntityBooking booking, RepoClient repoClient){
        String bookingDayMonth = booking.getBookingDate().format(DateTimeFormatter.ofPattern("dd-MM"));
        Integer numOfPeople = booking.getNumOfPeople();
        StringBuilder discountsList = new StringBuilder();
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
                    client.setVisistsPerMonth(visitsPerMonth + 1);
                } else {
                    discount = 0; // Si el cliente no está registrado, no se aplica descuento
                }
                discountsList.append(discount).append(",");
            }
        }
        if (3 <= numOfPeople && numOfPeople <= 5) {
            int bDayDiscountAplied = 0;
            for (String rut : clientRuts) {
                EntityClient client = repoClient.findByClientRUT(rut);
                if (client != null) {
                    Integer visitsPerMonth = client.getVisistsPerMonth();
                    String clientBirthday = client.getClientBirthday();
                    if (bDayDiscountAplied == 0 && clientBirthday != null && clientBirthday.substring(0, 5).equals(bookingDayMonth)) {
                        discount = 50;
                        bDayDiscountAplied = 1;
                    } else {
                        discount = (5 == visitsPerMonth || visitsPerMonth == 6) ? 20
                                : (visitsPerMonth >= 7) ? 30
                                : 10; // Descuento por grupo de 3 a 5 personas
                    }
                    client.setVisistsPerMonth(visitsPerMonth + 1);
                } else {
                    discount = 0; // Si el cliente no está registrado, no se aplica descuento
                }
                discountsList.append(discount).append(",");
            }
        }
        if (6 <= numOfPeople && numOfPeople <= 10) {
            int bDayDiscountAplied = 0;
            for (String rut : clientRuts) {
                EntityClient client = repoClient.findByClientRUT(rut);
                if (client != null) {
                    Integer visitsPerMonth = client.getVisistsPerMonth();
                    String clientBirthday = client.getClientBirthday();
                    if (bDayDiscountAplied < 3 && clientBirthday != null && clientBirthday.substring(0, 5).equals(bookingDayMonth)) {
                        discount = 50;
                        bDayDiscountAplied += 1;
                    } else {
                        discount = (visitsPerMonth >= 7) ? 30
                                : 20; // Descuento por el grupo de 6 a 10 personas
                    }
                    client.setVisistsPerMonth(visitsPerMonth + 1);
                } else {
                    discount = 0; // Si el cliente no está registrado, no se aplica descuento
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
                } else {
                    discount = 0; // Si el cliente no está registrado, no se aplica descuento
                }
                discountsList.append(discount).append(",");
            }
        }
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
}