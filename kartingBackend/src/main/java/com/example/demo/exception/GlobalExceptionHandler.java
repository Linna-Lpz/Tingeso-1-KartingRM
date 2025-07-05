package com.example.demo.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ClientValidationException.class)
    public ResponseEntity<String> handleClientValidationException(ClientValidationException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
    @ExceptionHandler(BookingValidationException.class)
    public ResponseEntity<String> handleBookingValidationException(BookingValidationException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}
