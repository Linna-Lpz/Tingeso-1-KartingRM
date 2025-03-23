package com.example.demo.repositories;

import com.example.demo.entities.EntityUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepoUser extends JpaRepository<EntityUser, Long> {
    EntityUser findByClientName(String clientName);
    String findByClientEmail(String clientEmail);
}
