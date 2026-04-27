package com.example.ecommerce_project.controller;

import com.example.ecommerce_project.service.StripeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private StripeService stripeService;

    @PostMapping("/create-intent")
    public Map<String, String> createPaymentIntent(@RequestBody Map<String, Double> data) throws Exception {
        String clientSecret = stripeService.createPaymentIntent(data.get("amount"));
        Map<String, String> response = new HashMap<>();
        response.put("clientSecret", clientSecret);
        return response;
    }
}