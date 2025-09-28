package com.example.restaurant.backend.Repository;

import com.example.restaurant.backend.Entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}