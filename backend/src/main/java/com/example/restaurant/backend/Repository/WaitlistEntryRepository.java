package com.example.restaurant.backend.Repository;

import com.example.restaurant.backend.Entity.WaitlistEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WaitlistEntryRepository extends JpaRepository<WaitlistEntry, Long> {
    List<WaitlistEntry> findByRestaurantIdAndStatusOrderByCreatedAtAsc(Long restaurantId, String status);
    List<WaitlistEntry> findByRestaurantIdOrderByCreatedAtAsc(Long restaurantId);
}
