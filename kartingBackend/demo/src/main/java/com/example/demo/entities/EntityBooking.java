package com.example.demo.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "booking")
public class EntityBooking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //TO DO: fecha y hora de la reserva
    @Column(name = "booking_date")
    private LocalDate bookingDate; // DD-MM-YYYY
    @Column(name = "booking_time")
    private LocalTime bookingTime; // HH:MM

    private Integer lapsOrMaxTimeAllowed;
    private Integer numOfPeople;
    private String clientsRUT; // Lista con los rut de los clientes
    private String clientsNames; //
    private String clientsEmails; // Lista con los correos de los clientes

    private String totalPrice; // Tarifa base *evaluar eliminar y dejar en el comprobante
    private Integer totalDurationReservation; // Tiempo total duracion reserva *evaluar eliminar y dejar en el comprobante


}
