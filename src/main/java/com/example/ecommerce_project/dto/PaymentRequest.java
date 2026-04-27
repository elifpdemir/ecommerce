package com.example.ecommerce_project.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private Long orderId;
    private Double amount;
    private String currency;
    private String stripeToken; // Stripe'ın frontend'den verdiği güvenli token
}