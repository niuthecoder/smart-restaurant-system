package com.example.restaurant.backend.config;

import com.example.restaurant.backend.Entity.RestaurantTable;
import com.example.restaurant.backend.Repository.RestaurantTableRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

@Configuration
public class TableSeeder {

    @Bean
    @Order(3)
    CommandLineRunner seedTables(RestaurantTableRepository tableRepo,
                                 com.example.restaurant.backend.Repository.RestaurantRepository restaurantRepo) {
        return args -> {
            Long restaurantId = restaurantRepo.findAll().stream()
                    .findFirst()
                    .map(com.example.restaurant.backend.Entity.Restaurant::getId)
                    .orElse(1L);

            if (tableRepo.count() > 0) return; // do not delete existing tables

            for (int n = 1; n <= 30; n++) {
                RestaurantTable t = new RestaurantTable();
                t.setRestaurantId(restaurantId);
                t.setNumber(n);
                t.setCapacity(4);
                t.setOccupied(false);

                if (n <= 10) {
                    t.setSalon("SALON_1");
                    t.setSmokingAllowed(false);
                } else if (n <= 20) {
                    t.setSalon("SALON_2");
                    t.setSmokingAllowed(true);
                } else {
                    t.setSalon("SALON_3");
                    t.setSmokingAllowed(true);
                }

                tableRepo.save(t);
            }
        };
    }
}
