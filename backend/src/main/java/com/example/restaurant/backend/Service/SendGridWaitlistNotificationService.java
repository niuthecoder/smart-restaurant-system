package com.example.restaurant.backend.Service;

import com.example.restaurant.backend.Entity.WaitlistEntry;
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
public class SendGridWaitlistNotificationService implements WaitlistNotificationService {

    private static final Logger log = LoggerFactory.getLogger(SendGridWaitlistNotificationService.class);
    private static final String SENDGRID_URL = "https://api.sendgrid.com/v3/mail/send";

    private final String apiKey;
    private final String fromEmail;
    private final String fromName;
    private final RestTemplate restTemplate = new RestTemplate();

    public SendGridWaitlistNotificationService(
            @org.springframework.beans.factory.annotation.Value("${app.notification.sendgrid.api-key}") String apiKey,
            @org.springframework.beans.factory.annotation.Value("${app.notification.sendgrid.from:noreply@example.com}") String fromEmail,
            @org.springframework.beans.factory.annotation.Value("${app.notification.sendgrid.from-name:Restaurant}") String fromName) {
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
        this.fromName = fromName;
    }

    @Override
    public void sendTableReady(WaitlistEntry entry) {
        if (entry.getGuestEmail() == null || entry.getGuestEmail().isBlank()) {
            log.debug("No guest email for waitlist entry {}, skip send", entry.getId());
            return;
        }
        String body = String.format(
                "Hi %s,\n\nYour table is ready! Please come to the host stand. We're looking forward to seeing you.\n\nParty of %d",
                entry.getGuestName() != null ? entry.getGuestName() : "Guest",
                entry.getPartySize() != null ? entry.getPartySize() : 1);

        Map<String, Object> payload = Map.of(
                "personalizations", List.of(Map.of(
                        "to", List.of(Map.of("email", entry.getGuestEmail(), "name", entry.getGuestName() != null ? entry.getGuestName() : "Guest")))),
                "from", Map.of("email", fromEmail, "name", fromName),
                "subject", "Your table is ready!",
                "content", List.of(Map.of("type", "text/plain", "value", body)));

        try {
            var headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);
            restTemplate.postForEntity(SENDGRID_URL, new org.springframework.http.HttpEntity<>(payload, headers), String.class);
            log.info("Sent table-ready email to {} for waitlist entry {}", entry.getGuestEmail(), entry.getId());
        } catch (Exception e) {
            log.warn("SendGrid failed for waitlist {}: {}", entry.getId(), e.getMessage());
        }
    }
}
