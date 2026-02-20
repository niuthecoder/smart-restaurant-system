package com.example.restaurant.backend.Controller;

import com.example.restaurant.backend.Entity.ApiKey;
import com.example.restaurant.backend.Repository.ApiKeyRepository;
import com.example.restaurant.backend.config.TenantContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@RestController
@RequestMapping("/api/admin/api-keys")
public class AdminApiKeyController {

    private final ApiKeyRepository apiKeyRepository;

    public AdminApiKeyController(ApiKeyRepository apiKeyRepository) {
        this.apiKeyRepository = apiKeyRepository;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, String> body) {
        String name = body != null && body.containsKey("name") ? body.get("name") : "API Key";
        if (name == null) name = "API Key";
        long restaurantId = TenantContext.getCurrentRestaurantId();
        String rawKey = "sk_" + UUID.randomUUID().toString().replace("-", "");
        String hash = sha256(rawKey);

        ApiKey key = new ApiKey();
        key.setRestaurantId(restaurantId);
        key.setKeyHash(hash);
        key.setName(name.trim().isEmpty() ? "API Key" : name);
        key.setActive(true);
        apiKeyRepository.save(key);

        return ResponseEntity.ok(Map.of(
                "id", key.getId(),
                "name", key.getName(),
                "key", rawKey,
                "message", "Save this key; it will not be shown again."
        ));
    }

    @GetMapping
    public List<ApiKey> list() {
        long restaurantId = TenantContext.getCurrentRestaurantId();
        List<ApiKey> list = apiKeyRepository.findByRestaurantIdAndActiveTrue(restaurantId);
        list.forEach(k -> k.setKeyHash(null));
        return list;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> revoke(@PathVariable Long id) {
        long restaurantId = TenantContext.getCurrentRestaurantId();
        ApiKey key = apiKeyRepository.findById(id).orElse(null);
        if (key == null || !key.getRestaurantId().equals(restaurantId)) {
            return ResponseEntity.notFound().build();
        }
        key.setActive(false);
        apiKeyRepository.save(key);
        return ResponseEntity.noContent().build();
    }

    private static String sha256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] bytes = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }
}
