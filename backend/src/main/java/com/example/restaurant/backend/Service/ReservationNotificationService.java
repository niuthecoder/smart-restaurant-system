package com.example.restaurant.backend.Service;

import com.example.restaurant.backend.Entity.Reservation;

/**
 * Pluggable notification for reservation confirmation.
 * Implement with email (e.g. SendGrid, Mailgun) or SMS (e.g. Twilio) and
 * register as a bean; otherwise NoOpReservationNotificationService is used.
 */
public interface ReservationNotificationService {

    /**
     * Send confirmation to guest and/or notify staff after a reservation is created.
     * Implementations may send email, SMS, or push; failures should be logged, not thrown.
     */
    void sendConfirmation(Reservation reservation);
}
