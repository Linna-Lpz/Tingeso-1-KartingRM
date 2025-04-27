package com.example.demo.repositories;

import com.example.demo.entities.EntityBooking;
import jakarta.persistence.criteria.From;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface RepoBooking extends JpaRepository<EntityBooking, Long> {
    List<EntityBooking> findByBookingDate(LocalDate bookingDate);
    List<EntityBooking> findByBookingStatusContains(String status);
    List<EntityBooking> findByClientsRUTContains(String rut);

    @Query("SELECT b FROM EntityBooking b WHERE b.bookingStatus = ?1 AND DAY(b.bookingDate) = ?2 AND (b.lapsOrMaxTimeAllowed = ?3)")
    List<EntityBooking> findByStatusAndDayAndLapsOrMaxTime(String status, String dayOfMonth, Integer maxTimeAllowed);
}