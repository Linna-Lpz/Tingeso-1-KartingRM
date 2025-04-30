package com.example.demo.services;

import com.example.demo.entities.EntityBooking;
import com.example.demo.repositories.RepoBooking;
import jakarta.persistence.criteria.CriteriaBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ServiceCalculateReport {
    @Autowired
    RepoBooking repoBooking;


    /**
     * Método para obtener una LISTA de ingresos por mes según número de vueltas
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
     * Método para sumar los ingresos totales de UN MES según número de vueltas
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
     * Método para SUMAR los ingresos totales de un mes para el reporte 1
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

    // ------------------------- REPORTE 2 -----------------------------------------

    /**
     * Método para obtener una LISTA de ingresos por mes según número personas (1-2)
     * [10, valor1, valor2, valor3, valor4, valor5, . . ., valor12, total]
     * @param
     * @return lista de ingresos por mes
     */
    public List<Integer> getIncomesForMonthOfNumOfPeople(Integer people) {
        List<Integer> incomes = new ArrayList<>();
        Integer totalIncomes = 0;
        for (int month = 1; month <= 12; month++) {
            String monthString = String.format("%02d", month);
            System.out.println("Mes: " + monthString);//
            Integer income = getIncomesForNumOfPeople(people, monthString);
            totalIncomes += income;
            incomes.add(income);
        }
        incomes.add(totalIncomes);
        return incomes;
    }


    /**
     * Método para sumar los ingresos totales de UN MES según cantidad de personas
     * 1-2 personas: enero = $valor
     * @param people número de personas
     * @param month mes de la reserva
     * @return ingresos totales
     */
    public Integer getIncomesForNumOfPeople(Integer people, String month) {
        List<EntityBooking> bookings = new ArrayList<>();
        if (people == 1 || people == 2) {
            bookings = repoBooking.findByStatusAndDayAndNumOfPeople1or2("confirmada", month, people);
        } else if (people >= 3 && people <= 5) {
            bookings = repoBooking.findByStatusAndDayAndNumOfPeople3to5("confirmada", month, people);
        } else if (people >= 6 && people <= 10) {
            bookings = repoBooking.findByStatusAndDayAndNumOfPeople6to10("confirmada", month, people);
        } else if (people >= 11 && people <= 15) {
            bookings = repoBooking.findByStatusAndDayAndNumOfPeople11to15("confirmada", month, people);
        } else {
            System.out.println("Error: Número de personas no válido");
        }
        Integer incomes = 0;
        for (EntityBooking booking : bookings) {
            Integer numOfPeople = booking.getNumOfPeople();
            Integer price = Integer.parseInt(booking.getPrice());
            incomes += (price * numOfPeople);
        }
        return incomes;
    }

    /**
     * Método para SUMAR los ingresos totales de un mes para el reporte 2
     * @return lista de ingresos totales
     */
    public List<Integer> getIncomesForNumOfPeopleOfMonth(){
        List<Integer> totalIncomes = new ArrayList<>();
        for (int i = 0; i < 12; i++){
            Integer value1 = getIncomesForMonthOfNumOfPeople(2).get(i);
            Integer value2 = getIncomesForMonthOfNumOfPeople(5).get(i);
            Integer value3 = getIncomesForMonthOfNumOfPeople(10).get(i);
            Integer value4 = getIncomesForMonthOfNumOfPeople(15).get(i);
            totalIncomes.add(value1 + value2 + value3);
        }
        Integer value1 = getIncomesForMonthOfNumOfPeople(2).get(13);
        Integer value2 = getIncomesForMonthOfNumOfPeople(5).get(13);
        Integer value3 = getIncomesForMonthOfNumOfPeople(10).get(13);
        Integer value4 = getIncomesForMonthOfNumOfPeople(15).get(13);
        totalIncomes.add(value1 + value2 + value3 + value4);
        return totalIncomes;
    }


}
