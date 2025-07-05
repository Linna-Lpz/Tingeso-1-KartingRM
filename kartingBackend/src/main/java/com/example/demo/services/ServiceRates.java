package com.example.demo.services;

import org.springframework.stereotype.Service;

@Service
public class ServiceRates {

    public int calculatePrice(Integer lapsOrMaxTimeAllowed){
        int basePrice;
        basePrice = (lapsOrMaxTimeAllowed == 10)? 15000
                : (lapsOrMaxTimeAllowed == 15) ? 20000
                : (lapsOrMaxTimeAllowed == 20) ? 25000
                : 0;
        return basePrice;
    }

    public int calculateDuration(Integer lapsOrMaxTimeAllowed){
        int duration;
        duration = (lapsOrMaxTimeAllowed == 10)? 30
                : (lapsOrMaxTimeAllowed == 15) ? 35
                : (lapsOrMaxTimeAllowed == 20) ? 40
                : 0;
        return duration;
    }
}
