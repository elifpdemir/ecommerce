package com.example.ecommerce_project.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}