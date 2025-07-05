package com.example.demo.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "booking")
public class EntityBooking {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_date")
    private LocalDate bookingDate; // DD-MM-YYYY
    @Column(name = "booking_time")
    private LocalTime bookingTime; // HH:MM
    @Column(name = "booking_time_end")
    private LocalTime bookingTimeEnd; // HH:MM Tiempo total duración reserva

    private String bookingStatus; // Estado de la reserva (confirmada, sin confirmar, cancelada)

    private Integer lapsOrMaxTimeAllowed;
    private Integer numOfPeople;
    @Column(length = 1000)
    private String clientsRUT; // Lista con los rut de los clientes
    @Column(length = 1000)
    private String clientsNames; // Lista con los nombres de los clientes
    @Column(length = 1000)
    private String clientsEmails; // Lista con los correos de los clientes

    private String basePrice; // Tarifa base
    @Column(length = 1000)
    private String discounts; // Descuentos aplicados (cumpleaños, integrantes, visitas)
    @Column(length = 1000)
    private String totalPrice; // Tarifa con descuentos aplicados

    private String Iva = "19"; // Porcentaje impuesto
    private String totalWithIva; // Total con impuesto
    private Integer totalAmount; // Suma de los valores por cliente (Precio final)
}
