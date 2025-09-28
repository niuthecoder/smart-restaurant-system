package com.example.restaurant.backend.Repository;


import com.example.restaurant.backend.Entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
}
