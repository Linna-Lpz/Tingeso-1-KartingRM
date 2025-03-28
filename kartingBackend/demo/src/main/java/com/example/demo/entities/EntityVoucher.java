package com.example.demo.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "voucher")
public class EntityVoucher {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;

    LocalDate voucherDate;
    LocalDateTime voucherDateTime;
    Integer lapsOrMaxTimeAllowed;
    Integer numOfPeople;
    String clientWhoMadeReservation; //nombre de la persona que hizo la reserva
    String clientName;
    Integer price; // tarifa base
    // TO DO: descuentos
    Integer totalPrice; // tarifa total
    Integer iva; // impuesto
    Integer totalWithIva; // total con impuesto
}
