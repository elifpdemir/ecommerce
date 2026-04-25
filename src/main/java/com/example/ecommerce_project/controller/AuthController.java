package com.example.ecommerce_project.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ecommerce_project.dto.JwtResponse;
import com.example.ecommerce_project.dto.LoginRequest;
import com.example.ecommerce_project.entity.User;
import com.example.ecommerce_project.repository.UserRepository;
import com.example.ecommerce_project.security.JwtUtils;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    public AuthController(UserRepository userRepository, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User Not Found."));

        if (user.getPasswordHash().equals(loginRequest.getPassword())) {
            String token = jwtUtils.generateToken(user.getEmail());
            return ResponseEntity.ok(new JwtResponse(token, user.getEmail()));
        } else {
            return ResponseEntity.status(401).body("Invalid Password!");
        }
    }
}