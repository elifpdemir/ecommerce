package com.example.ecommerce_project.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.ecommerce_project.entity.Store;

import java.util.Optional;

public interface StoreRepository extends JpaRepository<Store, Integer> {
    Optional<Store> findByOwnerId(Integer ownerId);
}