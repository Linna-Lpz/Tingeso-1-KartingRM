package com.example.demo.services;

import com.example.demo.entities.EntityKard;
import com.example.demo.repositories.RepoKard;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ServiceKard {
   @Autowired
    RepoKard repoKard;

    /**
     * Método para guardar un kard
     * @param kard kard a guardar
     */
    public void saveKard(EntityKard kard) {
        String idKard = kard.getCoding();
        if(repoKard.findById(idKard).isEmpty()) {
            repoKard.save(kard);
            System.out.println("Kard guardado");
        }else {
            System.out.println("Error: Kard ya existe");
        }
    }
}
