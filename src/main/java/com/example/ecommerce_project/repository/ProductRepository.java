package com.example.ecommerce_project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.ecommerce_project.entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
}