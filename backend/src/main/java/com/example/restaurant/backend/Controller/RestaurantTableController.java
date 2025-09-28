package com.example.restaurant.backend.Controller;

import com.example.restaurant.backend.Entity.RestaurantTable;
import com.example.restaurant.backend.Repository.RestaurantTableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tables")
public class RestaurantTableController {

    @Autowired
    private RestaurantTableRepository tableRepository;

    // CREATE
    @PostMapping
    public RestaurantTable createTable(@RequestBody RestaurantTable table) {
        return tableRepository.save(table);
    }

    // READ ALL
    @GetMapping
    public List<RestaurantTable> getAllTables() {
        return tableRepository.findAll();
    }

    // READ ONE
    @GetMapping("/{id}")
    public RestaurantTable getTableById(@PathVariable Long id) {
        return tableRepository.findById(id).orElse(null);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void deleteTable(@PathVariable Long id) {
        tableRepository.deleteById(id);
    }
}