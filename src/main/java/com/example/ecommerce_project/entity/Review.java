package com.example.ecommerce_project.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "reviews", indexes = {
    @Index(name = "idx_review_product", columnList = "product_id")
})
@Data
public class Review {
    @Id
    private String id; // Görselde varchar(100) görünüyor

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "product_id")
    private Integer productId;

    @Column(name = "star_rating")
    private Integer starRating;

    private String sentiment;

    @Column(name = "review_head")
    private String reviewHead;

    @Column(name = "review_body")
    private String reviewBody;

    @Column(name = "review_date")
    private LocalDate reviewDate;
}
