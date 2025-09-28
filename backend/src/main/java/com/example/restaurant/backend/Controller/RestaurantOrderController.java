package com.example.restaurant.backend.Controller;

import com.example.restaurant.backend.Entity.RestaurantOrder;
import com.example.restaurant.backend.Entity.RestaurantTable;
import com.example.restaurant.backend.Repository.RestaurantOrderRepository;
import com.example.restaurant.backend.Repository.RestaurantTableRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")

public class RestaurantOrderController {

    @Autowired
    private RestaurantOrderRepository orderRepository;

    @Autowired
    private RestaurantTableRepository tableRepository;

    // CREATE ORDER
    @PostMapping
    public RestaurantOrder createOrder(@RequestBody RestaurantOrder order) {
        // Set table to occupied when order is created
        RestaurantTable table = tableRepository.findById(order.getTableId()).orElse(null);
        if (table != null) {
            table.setOccupied(true);
            tableRepository.save(table);
        }
        return orderRepository.save(order);
    }
    
    @PutMapping("/complete/{id}")
    public RestaurantOrder completeOrder(@PathVariable Long id) {
        RestaurantOrder order = orderRepository.findById(id).orElse(null);
        if (order != null) {
            order.setStatus("Completed");

            // Free the table
            RestaurantTable table = tableRepository.findById(order.getTableId()).orElse(null);
            if (table != null) {
                table.setOccupied(false);
                tableRepository.save(table);
            }

            orderRepository.save(order);
        }
        return order;
    }

    // GET ALL ORDERS
    @GetMapping
    public List<RestaurantOrder> getAllOrders() {
        return orderRepository.findAll();
    }

    // GET ORDER BY ID
    @GetMapping("/{id}")
    public RestaurantOrder getOrderById(@PathVariable Long id) {
        return orderRepository.findById(id).orElse(null);
    }

    // DELETE ORDER
    @DeleteMapping("/{id}")
    public void deleteOrder(@PathVariable Long id) {
        orderRepository.deleteById(id);
    }
}