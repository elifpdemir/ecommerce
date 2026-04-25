package com.example.ecommerce_project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.ecommerce_project.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByStoreId(Integer storeId);
}