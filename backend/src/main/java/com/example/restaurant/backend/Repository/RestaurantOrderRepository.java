package com.example.restaurant.backend.Repository;

import com.example.restaurant.backend.Entity.RestaurantOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface RestaurantOrderRepository extends JpaRepository<RestaurantOrder, Long> {

    // For admin dashboard filtering
    List<RestaurantOrder> findByStatus(String status);

    // Count orders by status
    Long countByStatus(String status);

    // FIXED: Get today's orders - use LocalDateTime comparison instead of DATE()
    @Query("SELECT COUNT(o) FROM RestaurantOrder o WHERE o.orderTime >= :startOfDay AND o.orderTime < :startOfNextDay")
    Long countTodayOrders(@Param("startOfDay") LocalDateTime startOfDay,
            @Param("startOfNextDay") LocalDateTime startOfNextDay);

    // FIXED: Get total revenue from completed orders
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM RestaurantOrder o WHERE o.status = 'COMPLETED'")
    Double getTotalRevenue();

    // Helper method to get today's date range
    default Long countTodayOrders() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime startOfNextDay = startOfDay.plusDays(1);
        return countTodayOrders(startOfDay, startOfNextDay);
    }
}