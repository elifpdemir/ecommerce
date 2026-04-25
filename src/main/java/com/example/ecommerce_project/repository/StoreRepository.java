package com.example.ecommerce_project.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.ecommerce_project.entity.Store;

public interface StoreRepository extends JpaRepository<Store, Integer> {}