package com.example.demo.controllers;

import com.example.demo.entities.EntityClient;
import com.example.demo.services.ServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/client")
@CrossOrigin(origins = "*")

public class ControlClient {
    @Autowired
    ServiceClient serviceClient;

    @PostMapping("/save")
    public ResponseEntity<EntityClient> saveClient(EntityClient entityClient) {
        serviceClient.saveClient(entityClient);
        return ResponseEntity.ok(entityClient);
    }
}
