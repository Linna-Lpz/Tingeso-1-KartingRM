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
@RequestMapping("/api/booking")
@CrossOrigin(origins = "*")

public class ControlBooking {
    @Autowired
    ServiceBooking serviceBooking;
    @Autowired
    ServiceVoucher serviceVoucher;

    @PostMapping("/save")
    public ResponseEntity<EntityBooking> saveBooking(@RequestBody EntityBooking booking) {
        serviceBooking.saveBooking(booking);
        return ResponseEntity.ok(booking);
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

    //---------------------------------------------------------------
    //    Método para x
    //---------------------------------------------------------------

    /**
     * Método para obtener una lista de reservas de un cliente
     * @param rut RUT del cliente
     * @return lista de reservas
     */
    @GetMapping("/getBookingsByUser/{rut}")
    public ResponseEntity<List<EntityBooking>> getBookingsByUserRut(@PathVariable String rut) {
        List<EntityBooking> bookings = serviceBooking.getBookingsByUserRut(rut);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/getTimesByDate/{date}")
    public ResponseEntity<List<LocalTime>> getTimesByDate(@PathVariable LocalDate date){
        List<LocalTime> times = serviceBooking.getTimesByDate(date);
        return ResponseEntity.ok(times);
    }

    @GetMapping("/getTimesEndByDate/{date}")
    public ResponseEntity<List<LocalTime>> getTimesEndByDate(@PathVariable LocalDate date){
        List<LocalTime> times = serviceBooking.getTimesEndByDate(date);
        return ResponseEntity.ok(times);
    }

    /**
     * Método para obtener una lista de reservas confirmadas
     */
    @GetMapping("/getConfirmedBookings")
    public ResponseEntity<List<EntityBooking>> getConfirmedBookings() {
        List<EntityBooking> bookings = serviceBooking.getConfirmedBookings();
        System.out.println("Entro a confirmadas");
        return ResponseEntity.ok(bookings);
    }

    //----------------------------------------------------------------
    // --- Método para rack semanal ---
    //----------------------------------------------------------------
    // TO DO: revisar quien llama y usa estas dos funciones contiguas
    @GetMapping("/findByBookingDate/{bookingDate}")
    public List<EntityBooking> findByBookingDate(@PathVariable LocalDate bookingDate){
        return serviceBooking.findByBookingDate(bookingDate);
    }

    @GetMapping("/findByClientsRUTContains/{rut}")
    public List<EntityBooking> findByClientsRUTContains(@PathVariable String rut){
        return serviceBooking.findByClientsRUTContains(rut);
    }

    //----------------------------------------------------------------
    // --- Métodos para exportar comprobantes ---
    //----------------------------------------------------------------


}