package com.example.restaurant.backend.Repository;

import com.example.restaurant.backend.Entity.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ApiKeyRepository extends JpaRepository<ApiKey, Long> {
    List<ApiKey> findByRestaurantIdAndActiveTrue(Long restaurantId);
    Optional<ApiKey> findByKeyHashAndActiveTrue(String keyHash);
}
