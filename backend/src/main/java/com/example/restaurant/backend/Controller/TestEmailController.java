package com.example.restaurant.backend.Controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.List;
import java.util.Map;

/**
 * Admin-only endpoint to verify SendGrid email configuration.
 */
@RestController
@RequestMapping("/api")
public class TestEmailController {

    private static final Logger log = LoggerFactory.getLogger(TestEmailController.class);
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String SENDGRID_URL = "https://api.sendgrid.com/v3/mail/send";

    @Value("${app.notification.sendgrid.api-key:}")
    private String apiKey;

    @Value("${app.notification.sendgrid.from:noreply@example.com}")
    private String fromEmail;

    @Value("${app.notification.sendgrid.from-name:Restaurant}")
    private String fromName;

    @PostMapping("/test-email")
    public ResponseEntity<?> sendTestEmail(@RequestBody(required = false) Map<String, String> body) {
        String to = body != null ? body.get("to") : null;
        if (to == null || to.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing 'to' email"));
        }
        if (apiKey == null || apiKey.isBlank()) {
            return ResponseEntity.status(503).body(Map.of("error", "Email service not configured"));
        }
        var payload = Map.of(
                "personalizations", List.of(Map.of("to", List.of(Map.of("email", to)))),
                "from", Map.of("email", fromEmail, "name", fromName),
                "subject", "Test from Saffron House",
                "content", List.of(Map.of("type", "text/plain", "value", "If you received this, SendGrid is working!"))
        );
        try {
            var headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);
            restTemplate.postForEntity(SENDGRID_URL, new org.springframework.http.HttpEntity<>(payload, headers), String.class);
            return ResponseEntity.ok(Map.of("ok", true, "message", "Test email sent to " + to));
        } catch (HttpStatusCodeException e) {
            log.error("SendGrid HTTP error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            return ResponseEntity.status(502).body(Map.of("error", "Email delivery failed. Check server logs."));
        } catch (Exception e) {
            log.error("SendGrid error", e);
            return ResponseEntity.status(500).body(Map.of("error", "Email delivery failed. Check server logs."));
        }
    }
}
