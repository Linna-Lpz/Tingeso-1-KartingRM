package com.example.demo.controllers;

import com.example.demo.entities.EntityBooking;
import com.example.demo.services.ServiceRack;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/rack")
@CrossOrigin(origins = "*")
public class ControlRack {

    @Autowired
    ServiceRack serviceRack;

    @GetMapping("/getBookingsForRack/{month}/{year}")
    public ResponseEntity<List<EntityBooking>> getBookingsForRack(@PathVariable String month, @PathVariable String year){
        List<EntityBooking> bookings = serviceRack.getBookingsForRack(month, year);
        return ResponseEntity.ok(bookings);
    }
}
