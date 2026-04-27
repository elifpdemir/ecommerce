package com.example.ecommerce_project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.ecommerce_project.entity.Review;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {
    List<Review> findByProductId(Integer productId);
    List<Review> findByUserId(Integer userId);

    @org.springframework.data.jpa.repository.Query("SELECT r FROM Review r JOIN Product p ON r.productId = p.id WHERE p.storeId = :storeId")
    List<Review> findByStoreId(@org.springframework.data.repository.query.Param("storeId") Integer storeId);
}