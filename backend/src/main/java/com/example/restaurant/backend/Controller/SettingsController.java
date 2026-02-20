package com.example.restaurant.backend.Controller;

import com.example.restaurant.backend.Entity.Restaurant;
import com.example.restaurant.backend.Repository.RestaurantRepository;
import com.example.restaurant.backend.config.TenantContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Public settings for customer-facing UI (branding).
 * No auth required.
 */
@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*")
public class SettingsController {

    private final RestaurantRepository restaurantRepository;

    public SettingsController(RestaurantRepository restaurantRepository) {
        this.restaurantRepository = restaurantRepository;
    }

    /** Branding for current tenant (name, logo, colors). Used by frontend for white-label. */
    @GetMapping("/branding")
    public ResponseEntity<Map<String, Object>> getBranding(
            @RequestParam(required = false) Long restaurantId) {
        long id = restaurantId != null ? restaurantId : TenantContext.getCurrentRestaurantId();
        Map<String, Object> map = new HashMap<>();
        restaurantRepository.findById(id).ifPresentOrElse(r -> {
            map.put("name", r.getName() != null ? r.getName() : "Restaurant");
            map.put("location", r.getLocation());
            map.put("logoUrl", r.getLogoUrl());
            map.put("primaryColor", r.getPrimaryColor() != null ? r.getPrimaryColor() : "#E63946");
            map.put("supportEmail", r.getSupportEmail());
            map.put("timezone", r.getTimezone() != null ? r.getTimezone() : "UTC");
            map.put("openTime", r.getOpenTime() != null ? r.getOpenTime().toString() : null);
            map.put("closeTime", r.getCloseTime() != null ? r.getCloseTime().toString() : null);
        }, () -> {
            map.put("name", "Restaurant");
            map.put("location", null);
            map.put("logoUrl", null);
            map.put("primaryColor", "#E63946");
            map.put("supportEmail", null);
            map.put("timezone", "UTC");
            map.put("openTime", null);
            map.put("closeTime", null);
        });
        return ResponseEntity.ok(map);
    }
}
