package com.example.restaurant.backend.Repository;

import com.example.restaurant.backend.Entity.AuditLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId, Pageable pageable);
}
