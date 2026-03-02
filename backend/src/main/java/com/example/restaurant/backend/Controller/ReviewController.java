package com.example.restaurant.backend.Controller;

import com.example.restaurant.backend.DTO.CreateReviewRequest;
import com.example.restaurant.backend.Entity.Review;
import com.example.restaurant.backend.Repository.ReviewRepository;
import com.example.restaurant.backend.Repository.RestaurantRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Reviews", description = "Customer reviews and ratings")
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final RestaurantRepository restaurantRepository;

    public ReviewController(ReviewRepository reviewRepository, RestaurantRepository restaurantRepository) {
        this.reviewRepository = reviewRepository;
        this.restaurantRepository = restaurantRepository;
    }

    @Operation(summary = "List reviews", description = "Paginated list of reviews sorted by newest first")
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

    @Operation(summary = "Submit a review", description = "Create a customer review with a 1-5 star rating")
    @ApiResponse(responseCode = "200", description = "Review saved")
    @ApiResponse(responseCode = "400", description = "Validation error (rating out of range, etc.)")
    @PostMapping
    public ResponseEntity<?> createReview(@Valid @RequestBody CreateReviewRequest req) {
        Long restaurantId = restaurantRepository.findAll().stream().findFirst()
                .map(r -> r.getId()).orElse(1L);

        Review review = new Review();
        review.setRestaurantId(restaurantId);
        review.setRating(req.getRating());
        review.setComment(req.getComment() != null ? req.getComment().trim() : null);
        review.setCustomerName(req.getCustomerName() != null ? req.getCustomerName().trim() : null);
        review.setOrderId(req.getOrderId());

        Review saved = reviewRepository.save(review);
        return ResponseEntity.ok(saved);
    }
}
