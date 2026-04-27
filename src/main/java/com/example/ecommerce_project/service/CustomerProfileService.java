package com.example.ecommerce_project.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.ecommerce_project.entity.CustomerProfile;
import com.example.ecommerce_project.repository.CustomerProfileRepository;

@Service
public class CustomerProfileService {
    private final CustomerProfileRepository customerProfileRepository;

    public CustomerProfileService(CustomerProfileRepository customerProfileRepository) {
        this.customerProfileRepository = customerProfileRepository;
    }

    public List<CustomerProfile> getAllCustomerProfiles() {
        return customerProfileRepository.findAll();
    }
}