package com.example.restaurant.backend.Service;

import com.example.restaurant.backend.Entity.WaitlistEntry;
import org.springframework.stereotype.Service;

/** Default no-op. Use SendGrid (when configured) for table-ready emails. */
@Service
public class NoOpWaitlistNotificationService implements WaitlistNotificationService {

    @Override
    public void sendTableReady(WaitlistEntry entry) {
        // No-op
    }
}
