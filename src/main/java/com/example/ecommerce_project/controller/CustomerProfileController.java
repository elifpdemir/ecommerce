package com.example.ecommerce_project.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ecommerce_project.entity.CustomerProfile;
import com.example.ecommerce_project.service.CustomerProfileService;

@RestController
@RequestMapping("/api/customer-profiles")
@CrossOrigin(origins = "http://localhost:4200")
public class CustomerProfileController {
    private final CustomerProfileService customerProfileService;

    public CustomerProfileController(CustomerProfileService customerProfileService) {
        this.customerProfileService = customerProfileService;
    }

    @GetMapping
    public List<CustomerProfile> getAllCustomerProfiles() {
        return customerProfileService.getAllCustomerProfiles();
    }
}