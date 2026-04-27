package com.example.ecommerce_project.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.ecommerce_project.dto.UserDTO;
import com.example.ecommerce_project.entity.User;
import com.example.ecommerce_project.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId()); // Artık burası Integer
        dto.setEmail(user.getEmail());
        dto.setRoleType(user.getRoleType() != null ? user.getRoleType().name() : "INDIVIDUAL");
        dto.setGender(user.getGender());
        return dto;
    }
}