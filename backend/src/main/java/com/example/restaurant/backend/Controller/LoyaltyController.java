package com.example.restaurant.backend.Controller;

import com.example.restaurant.backend.Service.LoyaltyService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Loyalty", description = "Customer loyalty points")
@RestController
@RequestMapping("/api/loyalty")
public class LoyaltyController {

    private final LoyaltyService loyaltyService;

    public LoyaltyController(LoyaltyService loyaltyService) {
        this.loyaltyService = loyaltyService;
    }

    @GetMapping("/balance")
    public ResponseEntity<Map<String, Object>> getBalance(@RequestParam String customerId) {
        int points = loyaltyService.getPoints(customerId);
        return ResponseEntity.ok(Map.of("points", points, "customerId", customerId));
    }

    @PostMapping("/redeem")
    public ResponseEntity<Map<String, Object>> redeem(@RequestBody Map<String, Object> body) {
        String customerId = (String) body.get("customerId");
        Number pts = (Number) body.get("points");
        if (customerId == null || pts == null)
            return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(loyaltyService.redeemPoints(customerId, pts.intValue()));
    }
}
