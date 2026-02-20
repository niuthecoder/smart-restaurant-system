package com.example.restaurant.backend.Service;

import com.example.restaurant.backend.Entity.RestaurantOrder;

/**
 * Pluggable notification for order confirmation (e.g. email when order is created).
 */
public interface OrderNotificationService {

    /**
     * Send order confirmation to customer if email is present. Failures should be logged, not thrown.
     */
    void sendOrderConfirmation(RestaurantOrder order);

    /**
     * Send "order ready" notification when status becomes READY. Failures should be logged, not thrown.
     */
    void sendOrderReady(RestaurantOrder order);
}
