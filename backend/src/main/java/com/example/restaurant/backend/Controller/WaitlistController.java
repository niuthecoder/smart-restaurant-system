package com.example.restaurant.backend.Controller;

import com.example.restaurant.backend.Entity.WaitlistEntry;
import com.example.restaurant.backend.Repository.WaitlistEntryRepository;
import com.example.restaurant.backend.Service.WaitlistNotificationService;
import com.example.restaurant.backend.config.TenantContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Tag(name = "Waitlist", description = "Walk-in waitlist management")
@RestController
@RequestMapping("/api/waitlist")
public class WaitlistController {

    private final WaitlistEntryRepository repository;
    private final WaitlistNotificationService waitlistNotificationService;

    public WaitlistController(WaitlistEntryRepository repository, WaitlistNotificationService waitlistNotificationService) {
        this.repository = repository;
        this.waitlistNotificationService = waitlistNotificationService;
    }

    @Operation(summary = "Join the waitlist", description = "Public: add a guest to the waitlist with name, phone, and party size")
    @PostMapping
    public ResponseEntity<?> join(@RequestBody Map<String, Object> body) {
        String guestName = body.get("guestName") instanceof String s ? s.trim() : "";
        String guestPhone = body.get("guestPhone") instanceof String s ? s.trim() : "";
        if (guestName.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Guest name is required"));
        }
        if (guestPhone.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Phone number is required"));
        }
        Object ps = body.get("partySize");
        int partySize = ps != null ? ((Number) ps).intValue() : 1;
        if (partySize < 1 || partySize > 20) {
            return ResponseEntity.badRequest().body(Map.of("error", "Party size must be between 1 and 20"));
        }
        WaitlistEntry e = new WaitlistEntry();
        e.setRestaurantId(TenantContext.getCurrentRestaurantId());
        e.setGuestName(guestName);
        e.setGuestPhone(guestPhone);
        e.setGuestEmail(body.get("guestEmail") instanceof String s ? s.trim() : null);
        e.setPartySize(partySize);
        e.setStatus("WAITING");
        e.setNotes(body.get("notes") instanceof String s ? s.trim() : null);
        return ResponseEntity.ok(repository.save(e));
    }

    /** Admin: list waitlist entries. */
    @GetMapping
    public List<WaitlistEntry> list() {
        return repository.findByRestaurantIdOrderByCreatedAtAsc(TenantContext.getCurrentRestaurantId());
    }

    /** Admin: mark as notified (table ready). */
    @PutMapping("/{id}/notify")
    public ResponseEntity<WaitlistEntry> notify(@PathVariable Long id) {
        WaitlistEntry e = repository.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        e.setStatus("NOTIFIED");
        e.setNotifiedAt(LocalDateTime.now());
        WaitlistEntry saved = repository.save(e);
        try {
            waitlistNotificationService.sendTableReady(saved);
        } catch (Exception ignored) {
            // Best-effort
        }
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<WaitlistEntry> setStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null) return ResponseEntity.badRequest().build();
        WaitlistEntry e = repository.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        e.setStatus(status.toUpperCase());
        if ("NOTIFIED".equals(status)) e.setNotifiedAt(LocalDateTime.now());
        WaitlistEntry saved = repository.save(e);
        if ("NOTIFIED".equals(status)) {
            try {
                waitlistNotificationService.sendTableReady(saved);
            } catch (Exception ignored) {
                // Best-effort
            }
        }
        return ResponseEntity.ok(saved);
    }
}
