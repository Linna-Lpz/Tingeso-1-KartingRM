package com.example.demo.services;

import com.example.demo.entities.EntityBooking;
import com.example.demo.entities.EntityUser;
import com.example.demo.repositories.RepoBooking;
import com.example.demo.repositories.RepoUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Service
public class ServiceBooking {
    @Autowired
    RepoBooking repoBooking;
    @Autowired
    RepoUser repoUser;

    /**
     * Método para guardar una reserva
     */
    public void saveBooking(EntityBooking booking) {

        List<Integer> allowedLapsOrTime = Arrays.asList(10, 15, 20);
        // Se verifica que se ingresen los parametros de la reserva
        if (!allowedLapsOrTime.contains(booking.getLapsOrMaxTimeAllowed()) || booking.getClientName().isEmpty() || booking.getClientEmail().equals("")) {
            System.out.println("Error: Campos incompletos");
        } else {
            String clientName = booking.getClientName();
            String clientEmail = booking.getClientEmail();


            // Se verifica si el usuario no existe en la base de datos
            if (repoUser.findByClientName(clientName) == null || repoUser.findByClientEmail(clientEmail) == null) {
                EntityUser newUser = new EntityUser();
                newUser.setClientName(clientName);
                newUser.setClientEmail(clientEmail);
                newUser.setClientBirthday(booking.getClientBirthday());
                newUser.setVisistsPerMonth(1);
                repoUser.save(newUser);
            } else {
                EntityUser client = repoUser.findByClientName(clientName);
                client.setVisistsPerMonth(client.getVisistsPerMonth() + 1);
                repoUser.save(client);
            }

            Integer price;
            // Se calcula el precio de la reserva
            if (booking.getLapsOrMaxTimeAllowed() == 10) {
                price = 15000;
                booking.setTotalDurationReservation(30);
            } else if (booking.getLapsOrMaxTimeAllowed() == 15) {
                price = 20000;
                booking.setTotalDurationReservation(35);
            } else {
                price = 25000;
                booking.setTotalDurationReservation(40);
            }
            Integer numOfPeople = booking.getNumOfPeople();
            price = price * numOfPeople;

            // Se calculan los descuentos aplicados a la reserva
            Integer price1 = discountsForNumberOfPeople(numOfPeople, price);

            EntityUser client = repoUser.findByClientName(clientName);
            Integer price2 = discountsForFrequentCustomers(client.getVisistsPerMonth(), price1);

            // TO DO: descuento fecha y hora de la reserva
            LocalDate bookingDate = booking.getBookingDate();
            Integer price3 = discountsForBirthday(client, bookingDate, numOfPeople, price2);

            booking.setTotalPrice(price3);

            repoBooking.save(booking);
            System.out.println("Reserva creada");
        }
    }

    /**
     * Método para calcular el descuento según la cantidad de personas incluidas en la reserva
     */
    public Integer discountsForNumberOfPeople(Integer numOfPeople, Integer price) {

        Integer discountPercentage = 0;

        if (numOfPeople == 1 || numOfPeople == 2) {
            return price + discountPercentage;
        } else if (3 <= numOfPeople || numOfPeople <= 5) {
            discountPercentage = 10;
        } else if (6 <= numOfPeople || numOfPeople <= 10) {
            discountPercentage = 20;
        } else if (11 <= numOfPeople || numOfPeople <= 15) {
            discountPercentage = 30;
        }
        return price - (price / discountPercentage);
    }

    /**
     * Método para calcular el descuento según la fecuencia de visitas del cliente
     */
    public Integer discountsForFrequentCustomers(Integer visistsPerMonth, Integer price) {
        Integer discountPercentage = 0;
        if (0 == visistsPerMonth || visistsPerMonth == 1) {
            return price;
        } else if (2 <= visistsPerMonth || visistsPerMonth <= 4) {
            discountPercentage = 10;
        } else if (5 <= visistsPerMonth || visistsPerMonth <= 6) {
            discountPercentage = 20;
        } else if (7 <= visistsPerMonth) {
            discountPercentage = 30;
        }
        return price - (price / discountPercentage);

    }

    /**
     * Método para aplicar descuento a clientes cumpleañeros
     */
    public Integer discountsForBirthday(EntityUser client, LocalDate bookingDate, Integer numOfPeople, Integer price) {
        if (3 <= numOfPeople && numOfPeople <= 10){
            String clientBirthday = client.getClientBirthday();
            String[] birthday = clientBirthday.split("-");
            Integer day = Integer.parseInt(birthday[0]);
            Integer month = Integer.parseInt(birthday[1]);

            if (bookingDate.getDayOfMonth() == day && bookingDate.getMonthValue() == month){
                if(numOfPeople <= 5){
                    return price - (price / 2);
                } else{
                    // TO DO: descuento por grupo de personas de cumpleaños
                    return price; //
                }
            } else {
                return price;
            }
        } else {
            return price;
        }
    }
}
