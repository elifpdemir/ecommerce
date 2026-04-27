package com.example.ecommerce_project.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ecommerce_project.entity.Review;
import com.example.ecommerce_project.service.ReviewService;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:4200")
public class ReviewController {
    private final ReviewService reviewService;
    private final com.example.ecommerce_project.repository.UserRepository userRepository;
    private final com.example.ecommerce_project.repository.StoreRepository storeRepository;

    public ReviewController(ReviewService reviewService, com.example.ecommerce_project.repository.UserRepository userRepository, com.example.ecommerce_project.repository.StoreRepository storeRepository) {
        this.reviewService = reviewService;
        this.userRepository = userRepository;
        this.storeRepository = storeRepository;
    }

    @GetMapping
    public List<Review> getAllReviews() {
        return reviewService.getAllReviews();
    }

    @GetMapping("/product/{productId}")
    public List<Review> getProductReviews(@org.springframework.web.bind.annotation.PathVariable Integer productId) {
        return reviewService.getReviewsByProductId(productId);
    }

    @GetMapping("/my")
    public List<Review> getMyReviews(java.security.Principal principal) {
        if (principal == null) return List.of();
        return userRepository.findByEmail(principal.getName())
            .map(user -> reviewService.getReviewsByUserId(user.getId()))
            .orElse(List.of());
    }

    @GetMapping("/store")
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('CORPORATE')")
    public List<Review> getStoreReviews(java.security.Principal principal) {
        if (principal == null) return List.of();
        com.example.ecommerce_project.entity.User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null) return List.of();
        
        return storeRepository.findByOwnerId(user.getId())
            .map(store -> reviewService.getReviewsByStoreId(store.getId()))
            .orElse(List.of());
    }

    @org.springframework.web.bind.annotation.PostMapping
    public Review addReview(@org.springframework.web.bind.annotation.RequestBody Review review, java.security.Principal principal) {
        if (principal != null) {
            userRepository.findByEmail(principal.getName()).ifPresent(u -> review.setUserId(u.getId()));
        }
        return reviewService.createReview(review);
    }
}