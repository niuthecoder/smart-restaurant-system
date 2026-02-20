package com.example.restaurant.backend.Repository;

import com.example.restaurant.backend.Entity.RestaurantOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface RestaurantOrderRepository extends JpaRepository<RestaurantOrder, Long> {

    List<RestaurantOrder> findByStatus(String status);

    Page<RestaurantOrder> findAllByOrderByOrderTimeDesc(Pageable pageable);

    Page<RestaurantOrder> findByStatusOrderByOrderTimeDesc(String status, Pageable pageable);
    Long countByStatus(String status);
    List<RestaurantOrder> findByStatusNot(String status);

    // FIXED: Get today's orders - use LocalDateTime comparison instead of DATE()
    @Query("SELECT COUNT(o) FROM RestaurantOrder o WHERE o.orderTime >= :startOfDay AND o.orderTime < :startOfNextDay")
    Long countTodayOrders(@Param("startOfDay") LocalDateTime startOfDay,
            @Param("startOfNextDay") LocalDateTime startOfNextDay);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM RestaurantOrder o WHERE o.status = 'COMPLETED'")
    Double getTotalRevenue();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM RestaurantOrder o WHERE o.status = 'COMPLETED' AND o.orderTime >= :from AND o.orderTime < :to")
    Double getRevenueBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    List<RestaurantOrder> findByOrderTimeBetween(LocalDateTime from, LocalDateTime to);

    // Helper method to get today's date range
    default Long countTodayOrders() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime startOfNextDay = startOfDay.plusDays(1);
        return countTodayOrders(startOfDay, startOfNextDay);
    }
}