package com.example.ecommerce_project.controller;

import com.example.ecommerce_project.dto.LoginRequest;
import com.example.ecommerce_project.entity.User;
import com.example.ecommerce_project.repository.UserRepository;
import com.example.ecommerce_project.security.JwtUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder; // Şifre çözücü makineyi ekledik

    public AuthController(UserRepository userRepository, JwtUtils jwtUtils, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
    // 1. Kullanıcıyı bul
    User user = userRepository.findByEmail(loginRequest.getEmail()).orElse(null);

    if (user != null) {
        // user.getPasswordHash() zaten String döndürüyorsa cast'e gerek yok, 
        // ama garanti olsun diye .toString() diyebiliriz.
        String dbPassword = user.getPasswordHash(); 
        String rawPassword = (String) loginRequest.getPassword();
        
        boolean isPasswordMatch = false;

        // BCrypt kontrolü (Yeni eklenen şifreli kullanıcılar için)
        try {
            isPasswordMatch = passwordEncoder.matches(rawPassword, dbPassword);
        } catch (Exception e) {
            // Log basıp geçebiliriz
        }

        // Düz metin kontrolü (Veritabanındaki 123456'lar için)
        if (!isPasswordMatch) {
            isPasswordMatch = rawPassword.equals(dbPassword);
        }

        if (isPasswordMatch) {
            // TOKEN ÜRETİLİYOR
            String token = jwtUtils.generateToken(user);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("email", user.getEmail());
            response.put("roleType", user.getRoleType()); // ADMIN, CORPORATE vs.

            return ResponseEntity.ok(response);
        }
    }
    // Giriş başarısızsa 401 dön
    return ResponseEntity.status(401).body("Invalid email or password!");
}
}