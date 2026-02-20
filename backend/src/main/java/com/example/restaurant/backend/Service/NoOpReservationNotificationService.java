package com.example.restaurant.backend.Service;

import com.example.restaurant.backend.Entity.Reservation;
import org.springframework.stereotype.Service;

/** Default no-op implementation. Use SendGrid bean (when configured) for real emails. */
@Service
public class NoOpReservationNotificationService implements ReservationNotificationService {

    @Override
    public void sendConfirmation(Reservation reservation) {
        // No-op. Plug in a real implementation (email/SMS) when needed.
    }
}
