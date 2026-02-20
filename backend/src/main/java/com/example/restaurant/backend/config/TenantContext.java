package com.example.restaurant.backend.config;

/**
 * Holds the current tenant (restaurant) ID for the request.
 * Used for multi-tenant filtering. Defaults to 1 for single-tenant.
 */
public final class TenantContext {

    public static final long DEFAULT_RESTAURANT_ID = 1L;

    private static final ThreadLocal<Long> currentRestaurantId = ThreadLocal.withInitial(() -> DEFAULT_RESTAURANT_ID);
    private static final ThreadLocal<String> currentUsername = new ThreadLocal<>();

    public static void setCurrentRestaurantId(Long restaurantId) {
        currentRestaurantId.set(restaurantId != null ? restaurantId : DEFAULT_RESTAURANT_ID);
    }

    public static long getCurrentRestaurantId() {
        Long id = currentRestaurantId.get();
        return id != null ? id : DEFAULT_RESTAURANT_ID;
    }

    public static void setCurrentUsername(String username) {
        currentUsername.set(username);
    }

    public static String getCurrentUsername() {
        String u = currentUsername.get();
        return u != null ? u : "system";
    }

    public static void clear() {
        currentRestaurantId.remove();
        currentUsername.remove();
    }

    private TenantContext() {}
}
