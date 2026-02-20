package com.example.restaurant.backend.Service;

import com.example.restaurant.backend.Entity.WaitlistEntry;

/**
 * Pluggable notification when a waitlist guest is notified (table ready).
 */
public interface WaitlistNotificationService {

    /**
     * Send "Your table is ready" to the guest (email/SMS). Failures should be logged, not thrown.
     */
    void sendTableReady(WaitlistEntry entry);
}
