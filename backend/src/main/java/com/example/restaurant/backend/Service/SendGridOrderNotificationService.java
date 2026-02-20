package com.example.restaurant.backend.Service;

import com.example.restaurant.backend.Entity.OrderItem;
import com.example.restaurant.backend.Entity.RestaurantOrder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Primary
@ConditionalOnProperty(name = "app.notification.sendgrid.api-key")
public class SendGridOrderNotificationService implements OrderNotificationService {

    private static final Logger log = LoggerFactory.getLogger(SendGridOrderNotificationService.class);
    private static final String SENDGRID_URL = "https://api.sendgrid.com/v3/mail/send";

    private final String apiKey;
    private final String fromEmail;
    private final String fromName;
    private final RestTemplate restTemplate = new RestTemplate();

    public SendGridOrderNotificationService(
            @org.springframework.beans.factory.annotation.Value("${app.notification.sendgrid.api-key}") String apiKey,
            @org.springframework.beans.factory.annotation.Value("${app.notification.sendgrid.from:noreply@example.com}") String fromEmail,
            @org.springframework.beans.factory.annotation.Value("${app.notification.sendgrid.from-name:Restaurant}") String fromName) {
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
        this.fromName = fromName;
        log.info("SendGrid order notifications enabled (from: {})", fromEmail);
    }

    @Override
    public void sendOrderConfirmation(RestaurantOrder order) {
        String email = order.getCustomerEmail();
        if (email == null || email.isBlank()) {
            log.info("Order {}: No customer email — skipping order confirmation email", order.getId());
            return;
        }
        log.info("Order {}: Sending confirmation email to {}", order.getId(), email);
        StringBuilder itemsText = new StringBuilder();
        if (order.getItems() != null) {
            for (OrderItem i : order.getItems()) {
                itemsText.append("  - ").append(i.getItemName()).append(" x ").append(i.getQuantity())
                        .append(" = $").append(String.format("%.2f", i.getSubtotal())).append("\n");
            }
        }
        double total = order.getTotalAmount() != null ? order.getTotalAmount() : 0.0;
        String body = String.format(
                "Your order has been received.\n\nOrder #%d\nCustomer: %s\n\nItems:\n%sTotal: $%.2f\n\nWe will notify you when it's ready.",
                order.getId(),
                order.getCustomerName() != null ? order.getCustomerName() : "Guest",
                itemsText.toString(),
                total);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("personalizations", List.of(Map.of(
                "to", List.of(Map.of("email", order.getCustomerEmail(), "name", order.getCustomerName() != null ? order.getCustomerName() : "Guest")))));
        payload.put("from", Map.of("email", fromEmail, "name", fromName));
        payload.put("subject", "Order confirmation #" + order.getId());
        payload.put("content", List.of(Map.of("type", "text/plain", "value", body)));

        try {
            var headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);
            restTemplate.postForEntity(SENDGRID_URL, new org.springframework.http.HttpEntity<>(payload, headers), String.class);
            log.info("Sent order confirmation email to {} for order {}", order.getCustomerEmail(), order.getId());
        } catch (HttpStatusCodeException e) {
            String responseBody = e.getResponseBodyAsString();
            log.error("SendGrid failed for order {}: HTTP {} - {}", order.getId(), e.getStatusCode(), responseBody != null && !responseBody.isEmpty() ? responseBody : e.getMessage());
        } catch (Exception e) {
            log.error("SendGrid failed for order {}: {}", order.getId(), e.getMessage());
        }
    }

    @Override
    public void sendOrderReady(RestaurantOrder order) {
        if (order.getCustomerEmail() == null || order.getCustomerEmail().isBlank()) {
            log.debug("No customer email for order {}, skip order-ready send", order.getId());
            return;
        }
        String body = String.format(
                "Your order #%d is ready for pickup/serve!\n\nThank you for dining with us.",
                order.getId());
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("personalizations", List.of(Map.of(
                "to", List.of(Map.of("email", order.getCustomerEmail(), "name", order.getCustomerName() != null ? order.getCustomerName() : "Guest")))));
        payload.put("from", Map.of("email", fromEmail, "name", fromName));
        payload.put("subject", "Your order #" + order.getId() + " is ready!");
        payload.put("content", List.of(Map.of("type", "text/plain", "value", body)));
        try {
            var headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);
            restTemplate.postForEntity(SENDGRID_URL, new org.springframework.http.HttpEntity<>(payload, headers), String.class);
            log.info("Sent order-ready email to {} for order {}", order.getCustomerEmail(), order.getId());
        } catch (Exception e) {
            log.warn("SendGrid order-ready failed for order {}: {}", order.getId(), e.getMessage());
        }
    }
}
