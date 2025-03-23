package com.example.demo.services;

import com.example.demo.entities.EntityBooking;
import com.example.demo.entities.EntityUser;
import com.example.demo.repositories.RepoBooking;
import com.example.demo.repositories.RepoUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
    public Boolean saveBooking(EntityBooking booking) {

        List<Integer> allowedLapsOrTime = Arrays.asList(10, 15, 20);
        // Se verifica que los parametros de la reserva sean completados
        if (!allowedLapsOrTime.contains(booking.getLapsOrMaxTimeAllowed()) || booking.getClientName().isEmpty() || booking.getClientEmail().equals("")) {
            System.out.println("Error: Campos incompletos");
            return false;
        } else {
            String clientName = booking.getClientName();
            String clientEmail = booking.getClientEmail();

            // Se verifica si el usuario ya existe en la base de datos
            if (repoUser.findByClientName(clientName) == null || repoUser.findByClientEmail(clientEmail) == null) {
                EntityUser newUser = new EntityUser();
                newUser.setClientName(clientName);
                newUser.setClientEmail(clientEmail);
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

            EntityUser client = repoUser.findByClientName(clientName);
            // Se calculan los descuentos aplicados a la reserva
            Integer price1 = discountsForNumberOfPeople(numOfPeople, price);
            Integer price2 = discountsForFrequentCustomers(client.getVisistsPerMonth(), price1);

            // TO DO: descuento fecha y hora de la reserva

            booking.setTotalPrice(price2);

            repoBooking.save(booking);
            System.out.println("Reserva creada");
            return true; //
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
}
