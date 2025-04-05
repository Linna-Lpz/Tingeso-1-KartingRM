package com.example.demo.controllers;

import com.example.demo.entities.EntityBooking;
import com.example.demo.services.ServiceBooking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/booking")
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

    /**
     * Método para confirmar o cancelar una reserva
     * @param isConfirmed Booleano que indica si la reserva fue confirmada o no
     *
     */
    @PostMapping("/confirm")
    public ResponseEntity<String> confirmBooking(@RequestBody Boolean isConfirmed, @RequestBody EntityBooking booking) {
        serviceBooking.confirmBooking(isConfirmed, booking);
        return ResponseEntity.ok("Reserva confirmada");
    }
}