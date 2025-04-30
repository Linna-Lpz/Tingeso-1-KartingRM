package com.example.demo.controllers;

import com.example.demo.services.ServiceCalculateReport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/report")
@CrossOrigin(origins = "*")
public class ControlCalculateReport {

    @Autowired
    ServiceCalculateReport serviceCalculateReport;

    /**
     * Método para obtener los ingresos totales de un mes según número de vueltas
     * @param lapsOrTimeMax Número de vueltas o tiempo máximo permitido
     * @return Lista de ingresos totales
     */
    @GetMapping("/getBookingsForReport1/{lapsOrTimeMax}")
    public ResponseEntity<List<Integer>> getIncomesForMonthOfLaps(@PathVariable Integer lapsOrTimeMax) {
        List<Integer> incomes = serviceCalculateReport.getIncomesForMonthOfLaps(lapsOrTimeMax);
        return ResponseEntity.ok(incomes);
    }

    /**
     * Método para obtener ingresos totales de un mes de todas las vueltas
     */
    @GetMapping("/getTotalForReport1")
    public ResponseEntity<List<Integer>> getIncomesForLapsOfMonth(){
        List<Integer> incomes = serviceCalculateReport.getIncomesForLapsOfMonth();
        return ResponseEntity.ok(incomes);
    }

    /**
     * Método para obtener los ingresos totales de un mes según número de personas
     * @param people Número de personas
     * @return Lista de ingresos totales
     */
    @GetMapping("/getBookingsForReport2/{people}")
    public ResponseEntity<List<Integer>> getIncomesForMonthOfNumOfPeople(@PathVariable Integer people){
        List<Integer> incomes = serviceCalculateReport.getIncomesForMonthOfNumOfPeople(people);
        return ResponseEntity.ok(incomes);
    }

    /**
     * Método para obtener ingresos totales de un mes de todas las vueltas
     */
    @GetMapping("/getTotalForReport2")
    public ResponseEntity<List<Integer>> getIncomesForNumOfPeopleOfMonth(){
        List<Integer> incomes = serviceCalculateReport.getIncomesForLapsOfMonth();
        return ResponseEntity.ok(incomes);
    }
}
