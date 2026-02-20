package com.example.restaurant.backend.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@Primary
@ConditionalOnProperty(name = "app.notification.sendgrid.api-key")
public class SendGridPasswordResetEmailService implements PasswordResetEmailService {

    private static final Logger log = LoggerFactory.getLogger(SendGridPasswordResetEmailService.class);
    private static final String SENDGRID_URL = "https://api.sendgrid.com/v3/mail/send";

    private final String apiKey;
    private final String fromEmail;
    private final String fromName;
    private final RestTemplate restTemplate = new RestTemplate();

    public SendGridPasswordResetEmailService(
            @org.springframework.beans.factory.annotation.Value("${app.notification.sendgrid.api-key}") String apiKey,
            @org.springframework.beans.factory.annotation.Value("${app.notification.sendgrid.from:noreply@example.com}") String fromEmail,
            @org.springframework.beans.factory.annotation.Value("${app.notification.sendgrid.from-name:Restaurant}") String fromName) {
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
        this.fromName = fromName;
    }

    @Override
    public void sendResetEmail(String toEmail, String resetLink) {
        if (toEmail == null || toEmail.isBlank()) return;
        String body = String.format(
                "You requested a password reset. Click the link below to set a new password (valid for 1 hour):\n\n%s\n\nIf you did not request this, ignore this email.",
                resetLink);

        Map<String, Object> payload = Map.of(
                "personalizations", List.of(Map.of("to", List.of(Map.of("email", toEmail)))),
                "from", Map.of("email", fromEmail, "name", fromName),
                "subject", "Reset your password",
                "content", List.of(Map.of("type", "text/plain", "value", body)));

        try {
            var headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);
            restTemplate.postForEntity(SENDGRID_URL, new org.springframework.http.HttpEntity<>(payload, headers), String.class);
            log.info("Sent password reset email to {}", toEmail);
        } catch (Exception e) {
            log.warn("SendGrid password reset email failed: {}", e.getMessage());
        }
    }
}
