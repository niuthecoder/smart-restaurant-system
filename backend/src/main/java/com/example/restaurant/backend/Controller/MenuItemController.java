package com.example.restaurant.backend.Controller;

import com.example.restaurant.backend.Entity.MenuItem;
import com.example.restaurant.backend.Repository.MenuItemRepository;
import com.example.restaurant.backend.config.TenantContext;
import com.example.restaurant.backend.util.MenuCategoryUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;

/** Category order for menu display (matches frontend tabs). */
final class MenuCategoryOrder {
    static final List<String> ORDER = List.of("Appetizer", "Soup", "Salad", "Kebab", "Rice", "Stew", "Drink", "Dessert", "Pizza", "Other");
    static int indexOf(String cat) {
        if (cat == null) return ORDER.size();
        for (int i = 0; i < ORDER.size(); i++) if (ORDER.get(i).equalsIgnoreCase(cat)) return i;
        return ORDER.size();
    }
}

@RestController
@RequestMapping("/api/menuitems")
public class MenuItemController {

    @Autowired
    private MenuItemRepository menuItemRepository;

    // CREATE
    @PostMapping
    public MenuItem createMenuItem(@RequestBody MenuItem menuItem) {
        if (menuItem.getRestaurantId() == null)
            menuItem.setRestaurantId(TenantContext.getCurrentRestaurantId());
        return menuItemRepository.save(menuItem);
    }

    // READ ALL (tenant-scoped). Returns items sorted by category (frontend order) then name so menu tabs show correct items.
    @GetMapping
    public List<MenuItem> getAllMenuItems() {
        Long restaurantId = TenantContext.getCurrentRestaurantId();
        List<MenuItem> list = menuItemRepository.findByRestaurantIdOrRestaurantIdIsNull(restaurantId);
        list.forEach(m -> m.setCategory(MenuCategoryUtil.normalize(m.getName(), m.getCategory())));
        list.sort(Comparator
                .comparingInt((MenuItem m) -> MenuCategoryOrder.indexOf(m.getCategory()))
                .thenComparing(MenuItem::getName, Comparator.nullsLast(String::compareTo)));
        return list;
    }

    // READ ONE
    @GetMapping("/{id}")
    public MenuItem getMenuItemById(@PathVariable Long id) {
        return menuItemRepository.findById(id).map(m -> {
            m.setCategory(MenuCategoryUtil.normalize(m.getName(), m.getCategory()));
            return m;
        }).orElse(null);
    }

    // UPDATE
    @PutMapping("/{id}")
    public MenuItem updateMenuItem(@PathVariable Long id, @RequestBody MenuItem menuItem) {
        MenuItem existing = menuItemRepository.findById(id).orElseThrow(() -> new RuntimeException("Menu item not found"));
        existing.setName(menuItem.getName());
        existing.setPrice(menuItem.getPrice());
        existing.setCategory(menuItem.getCategory());
        existing.setAvailable(menuItem.isAvailable());
        existing.setTags(menuItem.getTags());
        existing.setImage(menuItem.getImage());
        existing.setDescription(menuItem.getDescription());
        return menuItemRepository.save(existing);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void deleteMenuItem(@PathVariable Long id) {
        menuItemRepository.deleteById(id);
    }
}