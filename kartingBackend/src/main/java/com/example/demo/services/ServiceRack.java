package com.example.demo.services;

import com.example.demo.entities.EntityBooking;
import com.example.demo.repositories.RepoBooking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServiceRack {
    @Autowired
    RepoBooking repoBooking;

    public List<EntityBooking> getBookingsForRack(String month, String year) {
        return repoBooking.findByStatusAndMonthAndYear("confirmada", month, year);
    }
}
