package com.example.restaurant.backend.Controller;

import com.example.restaurant.backend.Entity.Review;
import com.example.restaurant.backend.Repository.ReviewRepository;
import com.example.restaurant.backend.Repository.RestaurantRepository;
import com.example.restaurant.backend.config.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final RestaurantRepository restaurantRepository;

    public ReviewController(ReviewRepository reviewRepository, RestaurantRepository restaurantRepository) {
        this.reviewRepository = reviewRepository;
        this.restaurantRepository = restaurantRepository;
    }

    @GetMapping
    public ResponseEntity<?> getReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (size <= 0) size = 20;
        if (size > 50) size = 50;
        Long restaurantId = restaurantRepository.findAll().stream().findFirst()
                .map(r -> r.getId()).orElse(1L);
        Page<Review> result = reviewRepository.findByRestaurantIdOrderByCreatedAtDesc(
                restaurantId, PageRequest.of(page, size));
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody Map<String, Object> body) {
        Integer rating = body.get("rating") != null ? ((Number) body.get("rating")).intValue() : null;
        if (rating == null || rating < 1 || rating > 5) {
            return ResponseEntity.badRequest().body(Map.of("error", "rating must be 1–5"));
        }
        Long restaurantId = restaurantRepository.findAll().stream().findFirst()
                .map(r -> r.getId()).orElse(1L);

        Review review = new Review();
        review.setRestaurantId(restaurantId);
        review.setRating(rating);
        review.setComment(body.get("comment") != null ? body.get("comment").toString().trim() : null);
        review.setCustomerName(body.get("customerName") != null ? body.get("customerName").toString().trim() : null);
        if (body.get("orderId") != null) {
            try {
                review.setOrderId(((Number) body.get("orderId")).longValue());
            } catch (Exception ignored) {}
        }

        Review saved = reviewRepository.save(review);
        return ResponseEntity.ok(saved);
    }
}
