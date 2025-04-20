package com.example.demo.controllers;

import com.example.demo.entities.EntityClient;
import com.example.demo.services.ServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/client")
@CrossOrigin(origins = "*")

public class ControlClient {
    @Autowired
    ServiceClient serviceClient;

    @PostMapping("/save")
    public ResponseEntity<EntityClient> saveClient(@RequestBody EntityClient client) {
        serviceClient.saveClient(client);
        return ResponseEntity.ok(client);
    }
}
