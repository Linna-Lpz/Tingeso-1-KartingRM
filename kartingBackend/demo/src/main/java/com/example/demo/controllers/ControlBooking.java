package com.example.demo.controllers;

import com.example.demo.entities.EntityBooking;
import com.example.demo.services.ServiceBooking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping
@CrossOrigin(origins = "*")

public class ControlBooking {
    @Autowired
    ServiceBooking serviceBooking;

    /**
     * Método para guardar una reserva
     * @param entityBooking Objeto de tipo EntityBooking
     */
    @PostMapping("/save")
    public ResponseEntity<EntityBooking> saveBooking(@RequestBody EntityBooking entityBooking) {
        serviceBooking.saveBooking(entityBooking);
        return ResponseEntity.ok(entityBooking);
    }

}
