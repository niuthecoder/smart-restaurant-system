package com.example.restaurant.backend.Repository;

import com.example.restaurant.backend.Entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
}
