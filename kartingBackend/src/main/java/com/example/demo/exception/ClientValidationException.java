package com.example.demo.exception;

public class ClientValidationException extends RuntimeException{
    public ClientValidationException(String message) {
        super(message);
    }
}
