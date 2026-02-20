package com.example.restaurant.backend.Repository;

import com.example.restaurant.backend.Entity.LoyaltyAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LoyaltyAccountRepository extends JpaRepository<LoyaltyAccount, Long> {
    Optional<LoyaltyAccount> findByRestaurantIdAndCustomerId(Long restaurantId, String customerId);
}
