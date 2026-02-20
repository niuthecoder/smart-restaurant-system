package com.example.restaurant.backend.Controller;

import com.example.restaurant.backend.Entity.RestaurantTable;
import com.example.restaurant.backend.Repository.RestaurantTableRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
public class RestaurantTableController {

    private final RestaurantTableRepository tableRepo;

    public RestaurantTableController(RestaurantTableRepository tableRepo) {
        this.tableRepo = tableRepo;
    }

    @GetMapping
    public List<RestaurantTable> getAll() {
        return tableRepo.findAll();
    }
}
