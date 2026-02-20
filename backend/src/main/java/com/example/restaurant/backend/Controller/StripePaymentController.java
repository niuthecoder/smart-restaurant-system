package com.example.restaurant.backend.Controller;

import com.example.restaurant.backend.Service.StripePaymentService;
import com.example.restaurant.backend.config.TenantContext;
import com.stripe.exception.StripeException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Create Stripe PaymentIntent for an order. Requires auth (waiter/admin).
 * Frontend uses clientSecret with Stripe.js / Elements to collect payment.
 */
@RestController
@RequestMapping("/api/payments")
public class StripePaymentController {

    private final StripePaymentService stripePaymentService;

    public StripePaymentController(StripePaymentService stripePaymentService) {
        this.stripePaymentService = stripePaymentService;
    }

    @PostMapping("/create-intent")
    public ResponseEntity<?> createIntent(@RequestBody Map<String, Long> body) {
        Long orderId = body != null ? body.get("orderId") : null;
        if (orderId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "orderId required"));
        }
        if (!stripePaymentService.isConfigured()) {
            return ResponseEntity.status(503).body(Map.of("error", "Payments not configured"));
        }
        try {
            Map<String, String> result = stripePaymentService.createPaymentIntent(orderId);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (StripeException e) {
            return ResponseEntity.status(502).body(Map.of("error", "Payment provider error: " + e.getMessage()));
        }
    }

    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> config() {
        return ResponseEntity.ok(Map.of(
                "stripeConfigured", stripePaymentService.isConfigured(),
                "publishableKey", stripePaymentService.getPublishableKey()
        ));
    }
}
