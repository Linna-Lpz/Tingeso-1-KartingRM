package com.example.demo.repositories;

import com.example.demo.entities.EntityUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RepoUser extends JpaRepository<EntityUser, Long> {
}
