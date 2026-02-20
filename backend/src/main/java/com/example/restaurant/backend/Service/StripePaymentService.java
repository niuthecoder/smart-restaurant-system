package com.example.restaurant.backend.Service;

import com.example.restaurant.backend.Entity.RestaurantOrder;
import com.example.restaurant.backend.Repository.RestaurantOrderRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

@Service
public class StripePaymentService {

    private final RestaurantOrderRepository orderRepository;

    @Value("${app.stripe.secret-key:}")
    private String secretKey;

    @Value("${app.stripe.webhook-secret:}")
    private String webhookSecret;

    @Value("${app.stripe.publishable-key:}")
    private String publishableKey;

    public StripePaymentService(RestaurantOrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @PostConstruct
    public void init() {
        if (secretKey != null && !secretKey.isBlank()) {
            Stripe.apiKey = secretKey;
        }
    }

    public boolean isConfigured() {
        return secretKey != null && !secretKey.isBlank();
    }

    public Map<String, String> createPaymentIntent(Long orderId) throws StripeException {
        if (!isConfigured()) {
            throw new IllegalStateException("Stripe is not configured.");
        }
        RestaurantOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        if (order.getPaidAt() != null) {
            throw new IllegalStateException("Order already paid");
        }
        double amount = order.getTotalAmount() != null ? order.getTotalAmount() : 0.0;
        if (amount <= 0) throw new IllegalArgumentException("Order total must be positive");
        int amountCents = (int) Math.round(amount * 100);

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount((long) amountCents)
                .setCurrency("usd")
                .putMetadata("orderId", String.valueOf(orderId))
                .build();

        PaymentIntent intent = PaymentIntent.create(params);
        Map<String, String> result = new HashMap<>();
        result.put("clientSecret", intent.getClientSecret());
        result.put("paymentIntentId", intent.getId());
        return result;
    }

    public void markOrderPaid(Long orderId) {
        orderRepository.findById(orderId).ifPresent(order -> {
            order.setPaidAt(java.time.LocalDateTime.now());
            orderRepository.save(order);
        });
    }

    public String getWebhookSecret() {
        return webhookSecret;
    }

    public String getPublishableKey() {
        return publishableKey != null ? publishableKey : "";
    }
}
