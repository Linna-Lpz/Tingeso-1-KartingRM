package com.example.demo.repositories;

import com.example.demo.entities.EntityBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface RepoBooking extends JpaRepository<EntityBooking, Long> {
    List<EntityBooking> findByBookingDateAndBookingTime(LocalDate bookingDate, LocalTime bookingTime);
}