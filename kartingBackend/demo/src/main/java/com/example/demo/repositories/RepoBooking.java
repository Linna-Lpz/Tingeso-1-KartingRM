package com.example.demo.repositories;

import com.example.demo.entities.EntityBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepoBooking extends JpaRepository<EntityBooking, Long> {

}