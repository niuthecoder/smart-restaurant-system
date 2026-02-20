package com.example.restaurant.backend.Service;

import com.example.restaurant.backend.Entity.LoyaltyAccount;
import com.example.restaurant.backend.Entity.RestaurantOrder;
import com.example.restaurant.backend.Repository.LoyaltyAccountRepository;
import com.example.restaurant.backend.config.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/** Points per dollar (e.g. 1 point per $1). Add on order complete; redeem for discount. */
@Service
public class LoyaltyService {

    private static final int POINTS_PER_DOLLAR = 1;
    private static final int POINTS_FOR_10_PERCENT = 100; // redeem 100 points = 10% off next order

    private final LoyaltyAccountRepository repository;

    public LoyaltyService(LoyaltyAccountRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void addPointsForOrder(RestaurantOrder order) {
        if (order.getTotalAmount() == null || order.getTotalAmount() <= 0) return;
        String customerId = order.getCustomerPhone() != null && !order.getCustomerPhone().isBlank()
                ? order.getCustomerPhone() : order.getCustomerName();
        if (customerId == null || customerId.isBlank()) return;
        long restaurantId = order.getRestaurantId() != null ? order.getRestaurantId() : TenantContext.getCurrentRestaurantId();
        int pointsToAdd = (int) (order.getTotalAmount() * POINTS_PER_DOLLAR);
        LoyaltyAccount acc = repository.findByRestaurantIdAndCustomerId(restaurantId, customerId)
                .orElseGet(() -> {
                    LoyaltyAccount a = new LoyaltyAccount();
                    a.setRestaurantId(restaurantId);
                    a.setCustomerId(customerId);
                    a.setCustomerName(order.getCustomerName());
                    a.setPoints(0);
                    return a;
                });
        acc.setPoints(acc.getPoints() + pointsToAdd);
        acc.setUpdatedAt(LocalDateTime.now());
        repository.save(acc);
    }

    public int getPoints(String customerId) {
        long restaurantId = TenantContext.getCurrentRestaurantId();
        return repository.findByRestaurantIdAndCustomerId(restaurantId, customerId)
                .map(LoyaltyAccount::getPoints)
                .orElse(0);
    }

    /** Redeem points for discount. Returns discount amount (e.g. 0.10 = 10%) and new balance. */
    @Transactional
    public java.util.Map<String, Object> redeemPoints(String customerId, int pointsToRedeem) {
        long restaurantId = TenantContext.getCurrentRestaurantId();
        LoyaltyAccount acc = repository.findByRestaurantIdAndCustomerId(restaurantId, customerId).orElse(null);
        int balance = acc != null ? acc.getPoints() : 0;
        if (pointsToRedeem <= 0 || pointsToRedeem > balance)
            return java.util.Map.of("discountPercent", 0, "pointsUsed", 0, "newBalance", balance);
        int used = Math.min(pointsToRedeem, POINTS_FOR_10_PERCENT);
        if (acc != null) {
            acc.setPoints(acc.getPoints() - used);
            acc.setUpdatedAt(LocalDateTime.now());
            repository.save(acc);
        }
        int discountPercent = (used / POINTS_FOR_10_PERCENT) * 10;
        return java.util.Map.of("discountPercent", discountPercent, "pointsUsed", used, "newBalance", acc != null ? acc.getPoints() : 0);
    }
}
