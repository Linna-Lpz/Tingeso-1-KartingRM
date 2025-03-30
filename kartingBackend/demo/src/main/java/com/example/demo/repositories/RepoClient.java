package com.example.demo.repositories;

import com.example.demo.entities.EntityClient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RepoClient extends JpaRepository<EntityClient, Long> {
    EntityClient findByClientRUT(String clientRUT);
}
