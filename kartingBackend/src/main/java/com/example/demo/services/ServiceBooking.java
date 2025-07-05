package com.example.demo.services;

import com.example.demo.entities.EntityBooking;
import com.example.demo.entities.EntityClient;
import com.example.demo.exception.BookingValidationException;
import com.example.demo.repositories.RepoBooking;
import com.example.demo.repositories.RepoClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class ServiceBooking {
    @Autowired
    RepoBooking repoBooking;
    @Autowired
    RepoClient repoClient;
    @Autowired
    ServiceRates serviceRates;
    @Autowired
    ServiceDiscounts serviceDiscounts;

    public void saveBooking(EntityBooking booking) {
        // Validar datos de la reserva
        validateBooking(booking);

        // Establecer tarifa base y duración de la reserva
        setPriceAndDuration(booking);

        // Establecer descuentos
        applyDiscountsPerClient(booking);

        // Calcular el total con IVA
        String totalWithIva = calculateTotalWithIva(booking.getTotalPrice(), booking.getIva());
        booking.setTotalWithIva(totalWithIva);

        // Calcular el monto total a pagar
        booking.setTotalAmount(calculateTotalPrice(totalWithIva));

        // Establecer estado de la reserva
        booking.setBookingStatus("sin confirmar");

        // Guardar la reserva
        repoBooking.save(booking);
    }

    //-----------------------------------------------------------
    //    Métodos para validar los datos de la reserva
    //-----------------------------------------------------------
    public void validateBooking(EntityBooking booking) {
        // Validar que la fecha de reserva no sea nula
        if (booking.getBookingDate() == null) {
            throw new BookingValidationException("La fecha de reserva no puede ser nula");
        }

        // Validar que la hora de reserva no sea nula
        if (booking.getBookingTime() == null) {
            throw new BookingValidationException("La hora de reserva no puede ser nula");
        }

        // Validar que la hora de reserva no fue reservada previamente
        if (!isBookingTimeValid(booking)) {
            throw new BookingValidationException("La hora de reserva ya está ocupada por otra reserva");
        }

        // Validar el número de vueltas o tiempo máximo permitido
        if ( booking.getLapsOrMaxTimeAllowed() != 10 &&
                booking.getLapsOrMaxTimeAllowed() != 15 &&
                booking.getLapsOrMaxTimeAllowed() != 20) {
            throw new BookingValidationException("El número de vueltas o tiempo máximo permitido debe ser 10, 15 o 20");
        }

        // Validar que el número de personas sea mayor a 0 y menor o igual a 15
        if (booking.getNumOfPeople() <= 0) {
            throw new BookingValidationException("El número de personas debe ser mayor a 0 y menor o igual a 15");
        }

        // Validar que el RUT del cliente no sea nulo o vacío
        if (booking.getClientsRUT() == null || booking.getClientsRUT().isEmpty()) {
            throw new BookingValidationException("El RUT del cliente no puede ser nulo o vacío");
        }

        // Validar que el RUT tenga el formato correcto
        String[] clientsRUT = booking.getClientsRUT().split(",");
        for (String rut : clientsRUT) {
            if (!rut.matches("\\d{1,8}-[\\dkK]")) {
                throw new BookingValidationException("El RUT '" + rut + "' no tiene el formato correcto (12345678-9)");            }
        }
    }

    public boolean isBookingTimeValid(EntityBooking booking) {
        LocalDate bookingDate = booking.getBookingDate();
        LocalTime bookingTime = booking.getBookingTime();

        // Obtener todas las reservas de la nueva reserva
        LocalTime newBookingTimeEnd = bookingTime.plusMinutes(serviceRates.calculateDuration(booking.getLapsOrMaxTimeAllowed())); // Asumiendo que cada vuelta dura 2 minutos
        // Obtener las reservas existentes para la fecha de reserva
        List<EntityBooking> existingBookings = repoBooking.findByBookingDate(bookingDate);

        if(existingBookings != null){
            for (EntityBooking existingBooking : existingBookings) {
                LocalTime existingBookingTime = existingBooking.getBookingTime();
                LocalTime existingBookingTimeEnd = existingBooking.getBookingTimeEnd();
                //Comprobar si hay solapamiento de horarios
                if (!newBookingTimeEnd.isBefore(existingBookingTimeEnd) && !bookingTime.isAfter(existingBookingTimeEnd)) {
                    return false;
                }
            }
        }
        return true;
    }

    //-----------------------------------------------------------
    //    Métodos para establecer tarifas y duración de la reserva
    //-----------------------------------------------------------

    /**
     * Método para establecer el precio base y la duración de la reserva
     * @param booking Reserva a la que se le establecerá el precio y la duración
     */
    public void setPriceAndDuration(EntityBooking booking){
        Integer lapsOrMaxTimeAllowed = booking.getLapsOrMaxTimeAllowed();
        Integer basePrice = serviceRates.calculatePrice(lapsOrMaxTimeAllowed);
        booking.setBasePrice(String.valueOf(basePrice));
        Integer duration = serviceRates.calculateDuration(lapsOrMaxTimeAllowed);
        booking.setBookingTimeEnd(booking.getBookingTime().plusMinutes(duration));
    }

    //-----------------------------------------------------------
    //    Métodos para establecer descuentos
    //-----------------------------------------------------------
    public void applyDiscountsPerClient(EntityBooking booking) {
        Integer basePrice = Integer.parseInt(booking.getBasePrice());
        Integer numOfPeople = booking.getNumOfPeople();
        String[] clientsRut = booking.getClientsRUT().split(",");
        StringBuilder discountsList = new StringBuilder();
        StringBuilder discountsListType = new StringBuilder();
        String bookingDayMonth = booking.getBookingDate().format(DateTimeFormatter.ofPattern("dd-MM"));
        int bDayDiscountApplied = 0;

        for(String rut : clientsRut) {
            EntityClient client = repoClient.findByClientRUT(rut);
            Integer discount = basePrice; // Tarifa con el descuento base aplicado
            String discountType = "no"; // Tipo de descuento aplicado

            if (client != null) {
                // Verificar si aplica el descuento de cumpleaños
                if ((numOfPeople >= 3 && numOfPeople <= 5 && bDayDiscountApplied == 0) ||
                        (numOfPeople >= 6 && numOfPeople <= 10 && bDayDiscountApplied < 3)) {
                    Integer birthdayDiscount = serviceDiscounts.discountForBirthday(client.getClientBirthday(), bookingDayMonth, basePrice);
                    if (!birthdayDiscount.equals(basePrice)) {
                        discount = birthdayDiscount;
                        discountType = "cumpleaños";
                        bDayDiscountApplied++;
                    }

                }
                // Si no aplica el descuento de cumpleaños, verificar el descuento por visitas
                if (discount == basePrice) {
                    Integer visitsDiscount = serviceDiscounts.discountForVisitsPerMonth(client.getVisitsPerMonth(), basePrice);
                    if (!visitsDiscount.equals(basePrice)) {
                        discount = visitsDiscount;
                        discountType = "visitas";
                    } else if (numOfPeople >= 3 && numOfPeople <= 15) {
                        // Aplicar el descuento por número de personas
                        discount = serviceDiscounts.discountForNumOfPeople(numOfPeople, basePrice);
                        discountType = "integrantes";
                    }
                }
                // Actualizar el número de visitas del cliente
                client.setVisitsPerMonth(client.getVisitsPerMonth() + 1);
            }
            discountsList.append(discount).append(",");
            discountsListType.append(discountType).append(",");
        }

        booking.setDiscounts(discountsListType.toString()); // Lista de descuentos aplicados (cumpleaños, visitas, integrantes)
        booking.setTotalPrice(discountsList.toString()); // Lista de precios con descuento
    }

    //-----------------------------------------------------------
    //    Métodos para calcular el precio total a pagar
    //-----------------------------------------------------------

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
            Integer price = Integer.parseInt(total);
            System.out.println("Precio base: " + price);
            Integer totalWithIvaValue = price + ((price * ivaI) / 100);
            System.out.println("Precio total con IVA: " + totalWithIvaValue);
            totalWithIva.append(totalWithIvaValue).append(",");
        }
        if (!totalWithIva.isEmpty()) {
            totalWithIva.setLength(totalWithIva.length() - 1); // Elimina la última coma al añadir los precios
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

    //-----------------------------------------------------------
    //    Métodos para establecer el estado de la reserva
    //-----------------------------------------------------------

    /**
     * Método para confirmar una reserva
     * @param bookingId id de la reserva
     */
    public void confirmBooking(Long bookingId) {
        EntityBooking booking = repoBooking.findById(bookingId)
                .orElseThrow(() -> new BookingValidationException("Reserva no encontrada con ID: " + bookingId));
        booking.setBookingStatus("confirmada");
        repoBooking.save(booking);
    }

    /**
     * Método para cancelar una reserva
     * @param bookingId id de la reserva
     */
    public void cancelBooking(Long bookingId) {
        EntityBooking booking = repoBooking.findById(bookingId)
                .orElseThrow(() -> new BookingValidationException("Reserva no encontrada con ID: " + bookingId));
        booking.setBookingStatus("cancelada");
        repoBooking.save(booking);
    }


    //------------------------------------------------------------
    //    Métodos generales para obtener reservas
    //------------------------------------------------------------

    /**
     * Método para obtener una lista de reservas
     * @return lista de reservas
     */
    public List<EntityBooking> getBookings() {
        return repoBooking.findByBookingStatusContains("confirmada");
    }

    public List<EntityBooking> findByBookingDate(LocalDate bookingDate){
        return repoBooking.findByBookingDate(bookingDate);
    }

    public List<EntityBooking> findByClientsRUTContains(String rut){
        return repoBooking.findByClientsRUTContains(rut);
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
     * Método para obtener una lista de reservas por fecha final
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
     * @return lista de reservas confirmadas
     */
    public List<EntityBooking> getConfirmedBookings() {
        return repoBooking.findByBookingStatusContains("confirmada");
    }
}
