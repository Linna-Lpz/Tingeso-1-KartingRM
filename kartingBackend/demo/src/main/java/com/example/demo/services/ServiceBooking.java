package com.example.demo.services;

import com.example.demo.entities.EntityBooking;
import com.example.demo.entities.EntityClient;
import com.example.demo.repositories.RepoBooking;
import com.example.demo.repositories.RepoClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
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
                numOfPeople == null || numOfPeople <= 0 ||
                clientsRUT == null || clientsRUT.trim().isEmpty() ||
                clientsNames == null || clientsNames.trim().isEmpty() ||
                clientEmail == null || clientEmail.trim().isEmpty()) {
            System.out.println("Los campos de la reserva no pueden estar vacíos.");
        }

        // Se valida que las vueltas o el tiempo máximo permitido sean válidos
        List<Integer> allowedLaps = Arrays.asList(10, 15, 20);
        if (!allowedLaps.contains(lapsOrMaxTimeAllowed)) {
            System.out.println("Las vueltas o el tiempo máximo permitido no son válidos.");
        }

        // Se valida que el número de personas sea válido
        if (numOfPeople < 1 || numOfPeople > 15) {
            System.out.println("El número de personas debe estar entre 1 y 15.");
        }

        // TO DO: validar fecha y hora no estén ya reservadas
        if (!isBookingTimeValid(booking.getBookingDate(), booking.getBookingTime(), repoBooking)) {
            System.out.println("Reserva no permitida en ese horario.");
        }


        // Se valida que el cliente ingresado esté registrado
        // Separar los RUTs de los clientes
        List<String> clientRuts = Arrays.stream(clientsRUT.split(","))
                .map(String::trim)
                .collect(Collectors.toList());

        // Verificar que el primer RUT (cliente principal) esté registrado
        String clientName = repoClient.findByClientRUT(clientRuts.get(0)).getClientName();
        if (clientName == null || clientName.trim().isEmpty()) {
            System.out.println("El cliente principal no está registrado.");
        } else {
            // Aplicar descuentos
            List<Integer> discountsList = new java.util.ArrayList<>(List.of());

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
                            String day = clientBirthday.substring(0, 2);
                            String month = clientBirthday.substring(3, 5);
                            String bookingDay = bookingDate.toString().substring(8, 10);
                            String bookingMonth = bookingDate.toString().substring(5, 7);
                            if (day.equals(bookingDay) && month.equals(bookingMonth)) {
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
                            String day = clientBirthday.substring(0, 2);
                            String month = clientBirthday.substring(3, 5);
                            String bookingDay = bookingDate.toString().substring(8, 10);
                            String bookingMonth = bookingDate.toString().substring(5, 7);
                            if (day.equals(bookingDay) && month.equals(bookingMonth)) {
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
        }

        // Se guarda la reserva
        EntityBooking bookingToSave = new EntityBooking();
        bookingToSave.setBookingDate(bookingDate);
        bookingToSave.setBookingTime(bookingTime);
        bookingToSave.setLapsOrMaxTimeAllowed(lapsOrMaxTimeAllowed);
        bookingToSave.setNumOfPeople(numOfPeople);
        bookingToSave.setClientsRUT(clientsRUT);
        bookingToSave.setClientsNames(clientsNames);
        bookingToSave.setClientsEmails(clientEmail);
        bookingToSave.setTotalPrice(0); // Tarifa base *evaluar eliminar y dejar en el comprobante
        bookingToSave.setTotalDurationReservation(0); // Tiempo total duracion reserva *evaluar eliminar y dejar en el comprobante

        repoBooking.save(bookingToSave);
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
}
