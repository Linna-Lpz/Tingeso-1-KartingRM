package com.example.demo.entities;

import jakarta.persistence.*;
import lombok.*;

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
    private Long lapsOrMaxTimeAllowed;
    private Long regularPrices;
    private Long totalDurationReservation;
    private Integer numOfPeople;
    private String clientName;
    //TO DO: fecha y hora de la reserva
}
