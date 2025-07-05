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

    // Query para los descuentos
    @Query("SELECT b FROM EntityBooking b WHERE b.bookingStatus = ?1 AND MONTH(b.bookingDate) = ?2 AND (b.lapsOrMaxTimeAllowed = ?3)")
    List<EntityBooking> findByStatusAndDayAndLapsOrMaxTime(String status, String month, Integer maxTimeAllowed);

    @Query("SELECT b FROM EntityBooking b WHERE b.bookingStatus = ?1 AND MONTH(b.bookingDate) = ?2 AND (b.numOfPeople = 1 OR b.numOfPeople = 2)")
    List<EntityBooking> findByStatusAndDayAndNumOfPeople1or2(String status, String month, Integer numOfPeople);

    @Query("SELECT b FROM EntityBooking b WHERE b.bookingStatus = ?1 AND MONTH(b.bookingDate) = ?2 AND (3 <= b.numOfPeople AND b.numOfPeople <= 5)")
    List<EntityBooking> findByStatusAndDayAndNumOfPeople3to5(String status, String month, Integer numOfPeople);

    @Query("SELECT b FROM EntityBooking b WHERE b.bookingStatus = ?1 AND MONTH(b.bookingDate) = ?2 AND (6 <= b.numOfPeople AND b.numOfPeople <= 10)")
    List<EntityBooking> findByStatusAndDayAndNumOfPeople6to10(String status, String month, Integer numOfPeople);

    @Query("SELECT b FROM EntityBooking b WHERE b.bookingStatus = ?1 AND MONTH(b.bookingDate) = ?2 AND (11 <= b.numOfPeople AND b.numOfPeople <= 15)")
    List<EntityBooking> findByStatusAndDayAndNumOfPeople11to15(String status, String month, Integer numOfPeople);

    // Query para el rack semanal
    @Query("SELECT b FROM EntityBooking b WHERE b.bookingStatus = ?1 AND MONTH(b.bookingDate) = ?2 AND YEAR(b.bookingDate) = ?3")
    List<EntityBooking> findByStatusAndMonthAndYear(String status, String month, String year);

}