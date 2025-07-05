package com.example.demo.controllers;

import com.example.demo.services.ServiceVoucher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/voucher")
@CrossOrigin(origins = "*")
public class ControlVoucher {
    @Autowired
    ServiceVoucher serviceVoucher;


    /**
     * Método para exportar el comprobante a Excel
     * @param bookingId ID de la reserva
     */
    @PostMapping("/export/{bookingId}")
    public ResponseEntity<byte[]> exportVoucherToExcel(@PathVariable Long bookingId) {
        return serviceVoucher.exportVoucherToExcel(bookingId);
    }

    /**
     * Método para enviar el comprobante por correo electrónico
     * @param bookingId ID de la reserva
     */
    @PostMapping("/send/{bookingId}")
    public void sendVoucherByEmail(@PathVariable Long bookingId) {
        serviceVoucher.sendVoucherByEmail(bookingId);
    }
}
