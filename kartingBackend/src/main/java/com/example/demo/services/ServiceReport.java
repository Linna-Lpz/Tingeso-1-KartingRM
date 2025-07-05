package com.example.demo.services;

import com.example.demo.entities.EntityBooking;
import com.example.demo.repositories.RepoBooking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ServiceReport {
    @Autowired
    private RepoBooking repoBooking;

    // Debt ratio de la deuda técnica

    /**
     * Método para obtener una LISTA de ingresos por mes según número de vueltas
     * [numVueltas, valor1, valor2, valor3, valor4, valor5, . . ., valor12, total]
     * @param lapsOrTimeMax número de vueltas o tiempo máximo
     * @return lista de ingresos por mes
     */
    public List<Integer> getIncomesForMonthOfLaps(Integer lapsOrTimeMax, Integer startMonth, Integer endMonth) {
        List<Integer> incomes = new ArrayList<>();
        Integer totalIncomes = 0;
        incomes.add(lapsOrTimeMax);
        while (startMonth <= endMonth) {
            String monthString = String.format("%02d", startMonth);
            Integer income = getIncomesForTimeAndMonth(lapsOrTimeMax, monthString);
            System.out.println("Mes: " + monthString + ", Ingreso: " + income);//
            totalIncomes += income;
            incomes.add(income);
            startMonth++;
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
            Integer price = Integer.parseInt(booking.getBasePrice());
            incomes += (price * numOfPeople);
        }
        return incomes;
    }

    /**
     * Método para SUMAR los ingresos totales de un mes para el reporte 1
     * @return lista de ingresos totales
     */
    public List<Integer> getIncomesForLapsOfMonth(Integer startMonth, Integer endMonth){
        int numMonths = endMonth - startMonth;
        List<Integer> totalIncomes = new ArrayList<>();
        for (int i = 1; i <= numMonths; i++){
            Integer value1 = getIncomesForMonthOfLaps(10, startMonth, endMonth).get(i);
            Integer value2 = getIncomesForMonthOfLaps(15, startMonth, endMonth).get(i);
            Integer value3 = getIncomesForMonthOfLaps(20, startMonth, endMonth).get(i);
            totalIncomes.add(value1 + value2 + value3);
        }
        Integer value1 = getIncomesForMonthOfLaps(10, startMonth, endMonth).get(numMonths + 1);
        Integer value2 = getIncomesForMonthOfLaps(15, startMonth, endMonth).get(numMonths + 1);
        Integer value3 = getIncomesForMonthOfLaps(20, startMonth, endMonth).get(numMonths + 1);
        totalIncomes.add(value1 + value2 + value3);
        return totalIncomes;
    }


    // ------------------------- REPORTE 2 -----------------------------------------

    /**
     * Método para obtener una LISTA de ingresos por mes según número personas (1-2)
     * [10, valor1, valor2, valor3, valor4, valor5, . . ., valor12, total]
     * @param people número de personas
     * @param startMonth mes de inicio
     * @param endMonth mes de fin
     * @return lista de ingresos por mes
     */
    public List<Integer> getIncomesForMonthOfNumOfPeople(Integer people, Integer startMonth, Integer endMonth) {
        List<Integer> incomes = new ArrayList<>();
        Integer totalIncomes = 0;
        while (startMonth <= endMonth) {
            String monthString = String.format("%02d", startMonth);
            System.out.println("Mes: " + monthString);//
            Integer income = getIncomesForNumOfPeople(people, monthString);
            totalIncomes += income;
            incomes.add(income);
            startMonth++;
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
            Integer price = Integer.parseInt(booking.getBasePrice());
            incomes += (price * numOfPeople);
        }
        return incomes;
    }

    /**
     * Método para SUMAR los ingresos totales de un mes para el reporte 2
     * @return lista de ingresos totales
     */
    public List<Integer> getIncomesForNumOfPeopleOfMonth(Integer startMonth, Integer endMonth){
        int numMonths = endMonth - startMonth;
        List<Integer> totalIncomes = new ArrayList<>();
        for (int i = 0; i < numMonths; i++){
            Integer value1 = getIncomesForMonthOfNumOfPeople(2, startMonth, endMonth).get(i);
            Integer value2 = getIncomesForMonthOfNumOfPeople(5, startMonth, endMonth).get(i);
            Integer value3 = getIncomesForMonthOfNumOfPeople(10, startMonth, endMonth).get(i);
            Integer value4 = getIncomesForMonthOfNumOfPeople(15, startMonth, endMonth).get(i);
            totalIncomes.add(value1 + value2 + value3 + value4);
        }
        Integer value1 = getIncomesForMonthOfNumOfPeople(2, startMonth, endMonth).get(numMonths + 1);
        Integer value2 = getIncomesForMonthOfNumOfPeople(5, startMonth, endMonth).get(numMonths + 1);
        Integer value3 = getIncomesForMonthOfNumOfPeople(10, startMonth, endMonth).get(numMonths + 13);
        Integer value4 = getIncomesForMonthOfNumOfPeople(15, startMonth, endMonth).get(numMonths + 1);
        totalIncomes.add(value1 + value2 + value3 + value4);
        return totalIncomes;
    }
}

