package com.example.demo.controllers;

import com.example.demo.entities.EntityBooking;
import com.example.demo.services.ServiceBooking;
import com.example.demo.services.ServiceVoucher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/booking")
@CrossOrigin(origins = "*")

public class ControlBooking {
    @Autowired
    ServiceBooking serviceBooking;
    @Autowired
    ServiceVoucher serviceVoucher;

    /**
     * Método para guardar una reserva
     * @param entityBooking Objeto de tipo EntityBooking
     */
    @PostMapping("/save")
    public ResponseEntity<EntityBooking> saveBooking(@RequestBody EntityBooking entityBooking) {
        serviceBooking.saveBooking(entityBooking);
        return ResponseEntity.ok(entityBooking);
    }

    /**
     * Método para confirmar o cancelar una reserva
     * @param bookingId ID de la reserva
     *
     */
    @PostMapping("/confirm/{bookingId}")
    public ResponseEntity<String> confirmBooking(@PathVariable Long bookingId) {
        serviceBooking.confirmBooking(bookingId);
        return ResponseEntity.ok("Reserva confirmada");
    }


    /**
     * Método para cancelar una reserva
     * @param bookingId ID de la reserva
     */
    @PostMapping("/cancel/{bookingId}")
    public ResponseEntity<String> cancelBooking(@PathVariable Long bookingId) {
        serviceBooking.cancelBooking(bookingId);
        return ResponseEntity.ok("Reserva cancelada");
    }

    /**
     * Método para obtener una lista de reservas de un cliente
     * @param rut RUT del cliente
     * @return Lista de reservas del cliente
     */
    @GetMapping("/getBookings/{rut}")
    public ResponseEntity<List<EntityBooking>> getBookingsByUserRut(@PathVariable String rut) {
        List<EntityBooking> bookings = serviceBooking.getBookingsByUserRut(rut);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Método para obtener una lista de reservas
     * @return Lista de reservas
     */
    @GetMapping("/getBookings")
    public ResponseEntity<List<EntityBooking>> getBookings() {
        List<EntityBooking> bookings = serviceBooking.getBookings();
        return ResponseEntity.ok(bookings);
    }

    /**
     * Método para obtener una lista de reservas por fecha
     */
    @GetMapping("/getBookingTimesByDate/{date}")
    public ResponseEntity<List<LocalTime>> getTimesByDate(@PathVariable LocalDate date) {
        List<LocalTime> times = serviceBooking.getTimesByDate(date);
        return ResponseEntity.ok(times);
    }

    /**
     * Método para obtener una lista de reservas por fecha
     */
    @GetMapping("/getBookingTimesEndByDate/{date}")
    public ResponseEntity<List<LocalTime>> getTimesEndByDate(@PathVariable LocalDate date) {
        List<LocalTime> times = serviceBooking.getTimesEndByDate(date);
        return ResponseEntity.ok(times);
    }

    /**
     * Método para exportar el comprobante a Excel
     */
    @PostMapping("/export/{bookingId}")
    public ResponseEntity<byte[]> exportVoucherToExcel(@PathVariable Long bookingId) {
        return serviceVoucher.exportVoucherToExcel(bookingId);
    }

    /**
     * Método para exportar el comprobante a PDF
     */
    @PostMapping("/convert/{bookingId}")
    public ResponseEntity<byte[]> convertExcelToPdf(@PathVariable Long bookingId) {
        return serviceVoucher.convertExcelToPdf(bookingId);
    }

}