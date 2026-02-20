package com.example.restaurant.backend.Service;

import com.example.restaurant.backend.Entity.Reservation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * Sends reservation confirmation email via SendGrid API when app.notification.sendgrid.api-key is set.
 * From address: app.notification.sendgrid.from (default: noreply@yourdomain.com).
 */
@Service
@Primary
@ConditionalOnProperty(name = "app.notification.sendgrid.api-key")
public class SendGridReservationNotificationService implements ReservationNotificationService {

    private static final Logger log = LoggerFactory.getLogger(SendGridReservationNotificationService.class);
    private static final String SENDGRID_URL = "https://api.sendgrid.com/v3/mail/send";

    private final String apiKey;
    private final String fromEmail;
    private final String fromName;
    private final RestTemplate restTemplate = new RestTemplate();

    public SendGridReservationNotificationService(
            @org.springframework.beans.factory.annotation.Value("${app.notification.sendgrid.api-key}") String apiKey,
            @org.springframework.beans.factory.annotation.Value("${app.notification.sendgrid.from:noreply@example.com}") String fromEmail,
            @org.springframework.beans.factory.annotation.Value("${app.notification.sendgrid.from-name:Restaurant}") String fromName) {
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
        this.fromName = fromName;
    }

    @Override
    public void sendConfirmation(Reservation reservation) {
        if (reservation.getGuestEmail() == null || reservation.getGuestEmail().isBlank()) {
            log.debug("No guest email for reservation {}, skip send", reservation.getReservationCode());
            return;
        }
        String time = reservation.getReservationTime() != null
                ? reservation.getReservationTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
                : "";
        String body = String.format(
                "Your reservation is confirmed.\n\nCode: %s\nGuest: %s\nTime: %s\nGuests: %d\n\nPlease present this code at the restaurant.",
                reservation.getReservationCode(),
                reservation.getGuestName(),
                time,
                reservation.getGuestCount());

        Map<String, Object> payload = Map.of(
                "personalizations", List.of(Map.of(
                        "to", List.of(Map.of("email", reservation.getGuestEmail(), "name", reservation.getGuestName())))),
                "from", Map.of("email", fromEmail, "name", fromName),
                "subject", "Reservation confirmed: " + reservation.getReservationCode(),
                "content", List.of(Map.of("type", "text/plain", "value", body)));

        try {
            var headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);
            restTemplate.postForEntity(SENDGRID_URL, new org.springframework.http.HttpEntity<>(payload, headers), String.class);
            log.info("Sent reservation confirmation email to {} for {}", reservation.getGuestEmail(), reservation.getReservationCode());
        } catch (Exception e) {
            log.warn("SendGrid failed for reservation {}: {}", reservation.getReservationCode(), e.getMessage());
        }
    }
}
