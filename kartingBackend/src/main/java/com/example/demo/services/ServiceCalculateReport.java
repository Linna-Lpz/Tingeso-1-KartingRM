package com.example.demo.services;

import com.example.demo.entities.EntityBooking;
import com.example.demo.repositories.RepoBooking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ServiceCalculateReport {
    @Autowired
    RepoBooking repoBooking;


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

}
