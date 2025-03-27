package com.example.demo.controllers;

import com.example.demo.entities.EntityKard;
import com.example.demo.services.ServiceKard;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping
@CrossOrigin(origins = "*")
public class ControlKard {
    @Autowired
    ServiceKard serviceKard;

    /**
     * Método para guardar un kard
     */
    @PostMapping("/saveKard")
    public ResponseEntity<EntityKard> saveKard(@RequestBody EntityKard entityKard) {
        serviceKard.saveKard(entityKard);
        return ResponseEntity.ok(entityKard);
    }
}
