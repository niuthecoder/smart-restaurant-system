package com.example.restaurant.backend.Controller;

import com.example.restaurant.backend.Entity.OrderItem;
import com.example.restaurant.backend.Repository.OrderItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/order-items")
public class OrderItemController {

    @Autowired
    private OrderItemRepository orderItemRepository;

    @PostMapping
    public OrderItem create(@RequestBody OrderItem item) {
        return orderItemRepository.save(item);
    }

    @GetMapping
    public List<OrderItem> getAll() {
        return orderItemRepository.findAll();
    }

    @GetMapping("/{id}")
    public OrderItem getById(@PathVariable Long id) {
        return orderItemRepository.findById(id).orElse(null);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        orderItemRepository.deleteById(id);
    }
}
