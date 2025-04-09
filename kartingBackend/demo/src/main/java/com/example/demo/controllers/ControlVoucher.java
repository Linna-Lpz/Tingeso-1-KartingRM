package com.example.demo.controllers;

import com.example.demo.entities.EntityBooking;
import com.example.demo.entities.EntityVoucher;
import com.example.demo.services.ServiceVoucher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.io.ByteArrayInputStream;
import java.util.List;

@RestController
@RequestMapping("/voucher")
@CrossOrigin(origins = "*")
public class ControlVoucher {
    @Autowired
    ServiceVoucher serviceVoucher;

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