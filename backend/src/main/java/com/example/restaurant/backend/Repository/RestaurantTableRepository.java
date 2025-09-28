package com.example.restaurant.backend.Repository;

import com.example.restaurant.backend.Entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {
}