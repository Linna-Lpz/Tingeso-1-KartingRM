package com.example.demo.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

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
    private Integer lapsOrMaxTimeAllowed;
    private Integer totalPrice;
    private Integer totalDurationReservation;
    private Integer numOfPeople;
    private String clientName;
    private String clientEmail;
    private String clientBirthday;
    private String guestsEmail;

    //TO DO: fecha y hora de la reserva
    private LocalDate bookingDate; // YYYY-MM-DD
}
