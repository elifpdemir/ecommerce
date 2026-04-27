package com.example.ecommerce_project.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    private String email;
    private String password;

    public Object getPassword() {
        return password;
        }

    public String getEmail() {
        return email;
    }
}