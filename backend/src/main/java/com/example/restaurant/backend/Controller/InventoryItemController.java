package com.example.restaurant.backend.Controller;

import com.example.restaurant.backend.Entity.InventoryItem;
import com.example.restaurant.backend.Repository.InventoryItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory")
public class InventoryItemController {

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    @PostMapping
    public InventoryItem create(@RequestBody InventoryItem item) {
        return inventoryItemRepository.save(item);
    }

    @GetMapping
    public List<InventoryItem> getAll() {
        return inventoryItemRepository.findAll();
    }

    @GetMapping("/{id}")
    public InventoryItem getById(@PathVariable Long id) {
        return inventoryItemRepository.findById(id).orElse(null);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        inventoryItemRepository.deleteById(id);
    }
}
