package com.example.ecommerce_project.dto;

import lombok.Data;

@Data
public class UserDTO {
    private Integer id;
    private String email;
    private String roleType;
    private String gender;
}
