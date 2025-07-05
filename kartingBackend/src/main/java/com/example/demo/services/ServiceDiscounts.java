package com.example.demo.services;

import org.springframework.stereotype.Service;

@Service
public class ServiceDiscounts {

    public int discountForNumOfPeople(Integer numOfPeople, int basePrice) {
        int discount;
        discount = (numOfPeople == 1 || numOfPeople == 2) ? 0
                : (3 <= numOfPeople && numOfPeople <= 5) ? 10
                : (6 <= numOfPeople && numOfPeople <= 10) ? 20
                : (11 <= numOfPeople && numOfPeople <= 15) ? 30
                : 0;
        return basePrice - ((basePrice * discount) / 100);
    }

    /**
     * Método para calcular el descuento por visitas al mes
     * @param visitsPerMonth visitas por mes
     * @param basePrice precio base
     * @return int
     */
    public int discountForVisitsPerMonth(Integer visitsPerMonth, int basePrice) {
        int discount;
        discount = (2 <= visitsPerMonth && visitsPerMonth <= 4) ? 10
                : (5 == visitsPerMonth || visitsPerMonth == 6) ? 20
                : (visitsPerMonth >= 7) ? 30
                : 0;
        return basePrice - ((basePrice * discount) / 100);
    }

    /**
     * Método para calcular el descuento por cumpleaños
     * @param clientBirthday fecha de cumpleaños del cliente
     * @param bookingDayMonth fecha de la reserva (día y mes)
     * @return int
     */
    public int discountForBirthday(String clientBirthday, String bookingDayMonth, int basePrice) {
        int discount = 0;
        if (clientBirthday != null && clientBirthday.substring(0, 5).equals(bookingDayMonth)) {
            discount = 50;
        }
        return basePrice - ((basePrice * discount) / 100);
    }
}
