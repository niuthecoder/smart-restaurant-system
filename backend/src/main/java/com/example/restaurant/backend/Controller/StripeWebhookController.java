package com.example.restaurant.backend.Controller;

import com.example.restaurant.backend.Service.StripePaymentService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stripe")
public class StripeWebhookController {

    private static final Logger log = LoggerFactory.getLogger(StripeWebhookController.class);

    private final StripePaymentService stripePaymentService;

    public StripeWebhookController(StripePaymentService stripePaymentService) {
        this.stripePaymentService = stripePaymentService;
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> webhook(@RequestBody String payload, @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        String webhookSecret = stripePaymentService.getWebhookSecret();
        if (webhookSecret == null || webhookSecret.isBlank()) {
            log.warn("Stripe webhook received but app.stripe.webhook-secret not set");
            return ResponseEntity.badRequest().body("Webhook not configured");
        }
        if (sigHeader == null || sigHeader.isBlank()) {
            return ResponseEntity.badRequest().body("Missing Stripe-Signature");
        }
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.warn("Stripe webhook signature invalid: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Invalid signature");
        }
        if ("payment_intent.succeeded".equals(event.getType())) {
            PaymentIntent intent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
            if (intent != null && intent.getMetadata() != null && intent.getMetadata().containsKey("orderId")) {
                try {
                    Long orderId = Long.parseLong(intent.getMetadata().get("orderId"));
                    stripePaymentService.markOrderPaid(orderId);
                    log.info("Order {} marked paid via Stripe webhook", orderId);
                } catch (Exception e) {
                    log.error("Failed to mark order {} paid: {}", intent.getMetadata().get("orderId"), e.getMessage());
                    return ResponseEntity.internalServerError().body("Failed to process payment");
                }
            }
        }
        return ResponseEntity.ok().body("ok");
    }
}
