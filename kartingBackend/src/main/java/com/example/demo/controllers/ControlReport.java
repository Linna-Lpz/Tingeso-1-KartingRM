package com.example.demo.controllers;

import com.example.demo.services.ServiceReport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reports")
@CrossOrigin(origins = "*")
public class ControlReport {
    @Autowired
    ServiceReport serviceReport;

    /**
     * Método para obtener los ingresos totales de un mes según número de vueltas
     * @param lapsOrTimeMax Número de vueltas o tiempo máximo permitido
     * @return Lista de ingresos totales
     */
    @GetMapping("/getBookingsForReport1/{lapsOrTimeMax}/{startMonth}/{endMonth}")
    public ResponseEntity<List<Integer>> getIncomesForMonthOfLaps(@PathVariable Integer lapsOrTimeMax, @PathVariable Integer startMonth, @PathVariable Integer endMonth) {
        List<Integer> incomes = serviceReport.getIncomesForMonthOfLaps(lapsOrTimeMax, startMonth, endMonth);
        return ResponseEntity.ok(incomes);
    }

    /**
     * Método para obtener ingresos totales de un mes de todas las vueltas
     */
    @GetMapping("/getTotalForReport1/{startMonth}/{endMonth}")
    public ResponseEntity<List<Integer>> getIncomesForLapsOfMonth(@PathVariable Integer startMonth, @PathVariable Integer endMonth){
        List<Integer> incomes = serviceReport.getIncomesForLapsOfMonth(startMonth, endMonth);
        return ResponseEntity.ok(incomes);
    }

    /**
     * Método para obtener los ingresos totales de un mes según número de personas
     * @param people Número de personas
     * @return Lista de ingresos totales
     */
    @GetMapping("/getBookingsForReport2/{people}/{startMonth}/{endMonth}")
    public ResponseEntity<List<Integer>> getIncomesForMonthOfNumOfPeople(@PathVariable Integer people, @PathVariable Integer startMonth, @PathVariable Integer endMonth){
        List<Integer> incomes = serviceReport.getIncomesForMonthOfNumOfPeople(people, startMonth, endMonth);
        return ResponseEntity.ok(incomes);
    }

    /**
     * Método para obtener ingresos totales de un mes de todas las vueltas
     */
    @GetMapping("/getTotalForReport2/{startMonth}/{endMonth}")
    public ResponseEntity<List<Integer>> getIncomesForNumOfPeopleOfMonth(@PathVariable Integer startMonth, @PathVariable Integer endMonth){
        List<Integer> incomes = serviceReport.getIncomesForLapsOfMonth(startMonth, endMonth);
        return ResponseEntity.ok(incomes);
    }
}
