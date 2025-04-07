package com.example.demo.controllers;

import com.example.demo.entities.EntityBooking;
import com.example.demo.entities.EntityVoucher;
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
     * Método para crear un nuevo comprobante
     */


    /**
     * Método para exportar el comprobante a Excel
     */
    @PostMapping("/export/{bookingId}")
    public ResponseEntity<byte[]> exportVoucherToExcel(@PathVariable Long bookingId) {
        return serviceVoucher.exportVoucherToExcel(bookingId);
    }
}