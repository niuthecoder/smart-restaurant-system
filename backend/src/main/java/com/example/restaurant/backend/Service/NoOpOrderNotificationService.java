package com.example.restaurant.backend.Service;

import com.example.restaurant.backend.Entity.RestaurantOrder;
import org.springframework.stereotype.Service;

/** Default no-op. Use SendGrid (when configured) for real order confirmation emails. */
@Service
public class NoOpOrderNotificationService implements OrderNotificationService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(NoOpOrderNotificationService.class);

    @Override
    public void sendOrderConfirmation(RestaurantOrder order) {
        log.info("Order {}: Email notifications disabled (SendGrid not configured)", order.getId());
    }

    @Override
    public void sendOrderReady(RestaurantOrder order) {
        // No-op
    }
}
