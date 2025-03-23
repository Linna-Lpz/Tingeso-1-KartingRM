package com.example.demo.repositories;

import com.example.demo.entities.EntityKard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepoKard extends JpaRepository<EntityKard, String> {
}
