package com.example.ecommerce_project.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.ecommerce_project.entity.Review;
import com.example.ecommerce_project.repository.ReviewRepository;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public List<Review> getReviewsByProductId(Integer productId) {
        return reviewRepository.findByProductId(productId);
    }

    public List<Review> getReviewsByUserId(Integer userId) {
        return reviewRepository.findByUserId(userId);
    }

    public List<Review> getReviewsByStoreId(Integer storeId) {
        return reviewRepository.findByStoreId(storeId);
    }

    public Review createReview(Review review) {
        // Otomatik Sentiment Analizi
        if (review.getStarRating() != null) {
            int stars = review.getStarRating();
            if (stars >= 4) {
                review.setSentiment("Satisfied");
            } else if (stars == 3) {
                review.setSentiment("Neutral");
            } else {
                review.setSentiment("Unsatisfied");
            }
        }
        
        if (review.getId() == null) {
            review.setId(java.util.UUID.randomUUID().toString());
        }
        if (review.getReviewDate() == null) {
            review.setReviewDate(java.time.LocalDate.now());
        }
        
        return reviewRepository.save(review);
    }
}