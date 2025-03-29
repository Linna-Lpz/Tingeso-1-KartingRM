package com.example.demo.services;

import com.example.demo.entities.EntityBooking;
import com.example.demo.entities.EntityClient;
import com.example.demo.repositories.RepoBooking;
import com.example.demo.repositories.RepoClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.swing.text.html.parser.Entity;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

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
        String clientsRUT = booking.getClientsRUT();

        // TO DO: Validar que la fecha y hora sigan disponibles

        // Validar los campos de la reserva
        if (!validateBookingFields(booking)) {
            return;
        }

        // Separar los RUTs de los clientes
        List<String> clientRuts = Arrays.stream(clientsRUT.split(","))
                                        .map(String::trim)
                                        .collect(Collectors.toList());

        if (!validateClientWhoMadeReservation(clientRuts)) {
            return;
        }

        String discountsList = discountsAplied(clientRuts, booking, repoClient);


        // Se guarda la reserva
        booking.setTotalPrice(discountsList); // Precios con el descuento aplicado a cada cliente
        booking.setTotalDurationReservation(0); // Tiempo total duracion reserva *evaluar eliminar y dejar en el comprobante

        repoBooking.save(booking);
    }

    /**
     * Método para verificar que los campos de la reserva se han completado
     */
    public Boolean validateBookingFields(EntityBooking booking) {
        LocalDate bookingDate = booking.getBookingDate();
        LocalTime bookingTime = booking.getBookingTime();
        Integer lapsOrMaxTimeAllowed = booking.getLapsOrMaxTimeAllowed();
        Integer numOfPeople = booking.getNumOfPeople();
        String clientsRUT = booking.getClientsRUT();
        String clientsNames = booking.getClientsNames();
        String clientEmail = booking.getClientsEmails();

        // Se valida que los campos de la reserva no estén vacíos
        if (bookingDate == null || bookingTime == null ||
                lapsOrMaxTimeAllowed == null ||
                numOfPeople == null ||
                clientsRUT == null || clientsRUT.trim().isEmpty() ||
                clientsNames == null || clientsNames.trim().isEmpty() ||
                clientEmail == null || clientEmail.trim().isEmpty()) {
            System.out.println("Los campos de la reserva no pueden estar vacíos.");
            return false;
        }

        // Se valida que las vueltas o el tiempo máximo permitido sean válidos
        List<Integer> allowedLaps = Arrays.asList(10, 15, 20);
        if (!allowedLaps.contains(lapsOrMaxTimeAllowed)) {
            System.out.println("Las vueltas o el tiempo máximo permitido no son válidos.");
            return false;
        }

        // Se valida que el número de personas sea válido
        if (numOfPeople < 1 || numOfPeople > 15) {
            System.out.println("El número de personas debe estar entre 1 y 15.");
            return false;
        }

        System.out.println("Se han completado todos los campos");
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
        // Definir horarios de apertura y cierre
        LocalTime openingWeekdays = LocalTime.of(14, 0); // Horario de apertura para días de semana
        LocalTime openingWeekends = LocalTime.of(10, 0); // Horario de apertura para fines de semana
        LocalTime closingTime = LocalTime.of(22, 0);

        // Determinar si es fin de semana o feriado
        boolean isWeekend = bookingDate.getDayOfWeek() == DayOfWeek.SATURDAY ||
                            bookingDate.getDayOfWeek() == DayOfWeek.SUNDAY;
        boolean isHoliday = checkIfHoliday(bookingDate); // Método que verifica si es feriado

        LocalTime openingTime = (isWeekend || isHoliday) ? openingWeekends : openingWeekdays;

        // Verificar si la hora está dentro del horario permitido
        if (bookingTime.isBefore(openingTime) || bookingTime.isAfter(closingTime)) {
            System.out.println("Hora de reserva fuera del horario permitido.");
            return false;
        }

        // Verificar disponibilidad en la base de datos
        List<EntityBooking> existingBookings = repoBooking.findByBookingDateAndBookingTime(bookingDate, bookingTime);
        if (!existingBookings.isEmpty()) {
            System.out.println("El horario ya está reservado.");
            return false;
        }

        return true; // La reserva es válida
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
     */
    public Boolean validateClientWhoMadeReservation(List<String> clientRuts) {
        // Verificar que el primer RUT (cliente principal) esté registrado
        String clientName = repoClient.findByClientRUT(clientRuts.get(0)).getClientName();
        if (clientName == null || clientName.trim().isEmpty()) {
            System.out.println("El cliente principal no está registrado.");
            return false;
        }
        System.out.println("El cliente principal está registrado");
        return true;
    }

    /**
     * Método para aplicar los descuentos a los clietnes registrados según corresponda
     */
    public String discountsAplied(List<String> clientRuts, EntityBooking booking, RepoClient repoClient){
        LocalDate bookingDate = booking.getBookingDate();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM");
        String bookingDayMonth = bookingDate.format(formatter);
        Integer numOfPeople = booking.getNumOfPeople();
        List<Integer> discountsList = new ArrayList<>();

        if (1 == numOfPeople || numOfPeople == 2) {
            for (String rut : clientRuts) {
                EntityClient client = repoClient.findByClientRUT(rut);
                if (client != null) {
                    Integer visitsPerMonth = client.getVisistsPerMonth();
                    if (0 == visitsPerMonth || visitsPerMonth == 1) {
                        client.setVisistsPerMonth(visitsPerMonth + 1);
                        discountsList.add(0);
                    } else if (2 <= visitsPerMonth && visitsPerMonth <= 4) {
                        client.setVisistsPerMonth(visitsPerMonth + 1);
                        discountsList.add(10);
                    } else if (5 == visitsPerMonth || visitsPerMonth == 6) {
                        client.setVisistsPerMonth(visitsPerMonth + 1);
                        discountsList.add(20);
                    } else {
                        client.setVisistsPerMonth(visitsPerMonth + 1);
                        discountsList.add(30);
                    }
                } else {
                    discountsList.add(0); // Si el cliente no está registrado, no se aplica descuento
                }
            }
        }
        if (3 <= numOfPeople && numOfPeople <= 5) {
            for (String rut : clientRuts) {
                EntityClient client = repoClient.findByClientRUT(rut);
                if (client != null) {
                    if (!discountsList.contains(50)) {
                        String clientBirthday = client.getClientBirthday();
                        if (clientBirthday != null && clientBirthday.substring(0, 5).equals(bookingDayMonth)) {
                            client.setVisistsPerMonth(client.getVisistsPerMonth() + 1);
                            discountsList.add(50);
                        }else {
                            Integer visitsPerMonth = client.getVisistsPerMonth();
                            if (0 == visitsPerMonth || visitsPerMonth == 1) {
                                client.setVisistsPerMonth(visitsPerMonth + 1);
                                discountsList.add(0);
                            } else if (2 <= visitsPerMonth && visitsPerMonth <= 4) {
                                client.setVisistsPerMonth(visitsPerMonth + 1);
                                discountsList.add(10);
                            } else if (5 == visitsPerMonth || visitsPerMonth == 6) {
                                client.setVisistsPerMonth(visitsPerMonth + 1);
                                discountsList.add(20);
                            } else if (7 <= visitsPerMonth) {
                                client.setVisistsPerMonth(visitsPerMonth + 1);
                                discountsList.add(30);
                            } else {
                                client.setVisistsPerMonth(visitsPerMonth + 1);
                                discountsList.add(10); // Descuento por grupo de 3 a 5 personas
                            }
                        }
                    }
                } else {
                    discountsList.add(0); // Si el cliente no está registrado, no se aplica descuento
                }
            }
        }
        if (6 <= numOfPeople && numOfPeople <= 10) {
            int discount50Count = 0;
            for (String rut : clientRuts) {
                EntityClient client = repoClient.findByClientRUT(rut);
                if (client != null) {
                    if (discount50Count < 2) {
                        String clientBirthday = client.getClientBirthday();
                        if (clientBirthday != null && clientBirthday.substring(0, 5).equals(bookingDayMonth)) {
                            client.setVisistsPerMonth(client.getVisistsPerMonth() + 1);
                            discountsList.add(50);
                            discount50Count++;
                        }
                    }
                    Integer visitsPerMonth = client.getVisistsPerMonth();
                    if (0 == visitsPerMonth || visitsPerMonth == 1) {
                        client.setVisistsPerMonth(visitsPerMonth + 1);
                        discountsList.add(0);
                    } else if (2 <= visitsPerMonth && visitsPerMonth <= 4) {
                        client.setVisistsPerMonth(visitsPerMonth + 1);
                        discountsList.add(10);
                    } else if (5 == visitsPerMonth || visitsPerMonth == 6) {
                        client.setVisistsPerMonth(visitsPerMonth + 1);
                        discountsList.add(20);
                    } else if (7 <= visitsPerMonth) {
                        client.setVisistsPerMonth(visitsPerMonth + 1);
                        discountsList.add(30);
                    } else {
                        client.setVisistsPerMonth(visitsPerMonth + 1);
                        discountsList.add(20); // Descuento por grupo de 6 a 10 personas
                    }
                } else {
                    discountsList.add(0); // Si el cliente no está registrado, no se aplica descuento
                }
            }
        }
        if (11 <= numOfPeople && numOfPeople <= 15) {
            for (String rut : clientRuts) {
                EntityClient client = repoClient.findByClientRUT(rut);
                if (client != null) {
                    Integer visitsPerMonth = client.getVisistsPerMonth();
                    if (0 == visitsPerMonth || visitsPerMonth == 1) {
                        client.setVisistsPerMonth(visitsPerMonth + 1);
                        discountsList.add(0);
                    } else if (2 <= visitsPerMonth && visitsPerMonth <= 4) {
                        client.setVisistsPerMonth(visitsPerMonth + 1);
                        discountsList.add(10);
                    } else if (5 == visitsPerMonth || visitsPerMonth == 6) {
                        client.setVisistsPerMonth(visitsPerMonth + 1);
                        discountsList.add(20);
                    } else if (7 <= visitsPerMonth) {
                        client.setVisistsPerMonth(visitsPerMonth + 1);
                        discountsList.add(30);
                    } else {
                        client.setVisistsPerMonth(visitsPerMonth + 1);
                        discountsList.add(30); // Descuento por grupo de 11 a 15 personas
                    }
                } else {
                    discountsList.add(0); // Si el cliente no está registrado, no se aplica descuento
                }
            }
        }
        // Convertir cada Integer a String
        // Unirlos con una coma
        return discountsList.stream()
                .map(String::valueOf) // Convertir cada Integer a String
                .collect(Collectors.joining(","));
    }


}
