package com.example.restaurant.backend.Repository;

import com.example.restaurant.backend.Entity.MenuItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    /** Items for a tenant (includes legacy null restaurantId). */
    List<MenuItem> findByRestaurantIdOrRestaurantIdIsNull(Long restaurantId);

    /** Find by name for fallback when ID mismatch (e.g. mock vs DB). */
    @Query("SELECT m FROM MenuItem m WHERE LOWER(m.name) = LOWER(:name) AND (m.restaurantId = :rid OR m.restaurantId IS NULL)")
    List<MenuItem> findByNameForRestaurant(@Param("name") String name, @Param("rid") Long restaurantId);

    /** Paginated version for large menus. */
    Page<MenuItem> findByRestaurantIdOrRestaurantIdIsNull(Long restaurantId, Pageable pageable);
}
