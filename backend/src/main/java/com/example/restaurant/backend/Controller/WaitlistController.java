package com.example.restaurant.backend.Controller;

import com.example.restaurant.backend.Entity.WaitlistEntry;
import com.example.restaurant.backend.Repository.WaitlistEntryRepository;
import com.example.restaurant.backend.Service.WaitlistNotificationService;
import com.example.restaurant.backend.config.TenantContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/waitlist")
@CrossOrigin(origins = "*")
public class WaitlistController {

    private final WaitlistEntryRepository repository;
    private final WaitlistNotificationService waitlistNotificationService;

    public WaitlistController(WaitlistEntryRepository repository, WaitlistNotificationService waitlistNotificationService) {
        this.repository = repository;
        this.waitlistNotificationService = waitlistNotificationService;
    }

    /** Public: join waitlist (name, phone, partySize). */
    @PostMapping
    public ResponseEntity<WaitlistEntry> join(@RequestBody Map<String, Object> body) {
        WaitlistEntry e = new WaitlistEntry();
        e.setRestaurantId(TenantContext.getCurrentRestaurantId());
        e.setGuestName((String) body.get("guestName"));
        e.setGuestPhone((String) body.get("guestPhone"));
        e.setGuestEmail((String) body.get("guestEmail"));
        Object ps = body.get("partySize");
        e.setPartySize(ps != null ? ((Number) ps).intValue() : 1);
        e.setStatus("WAITING");
        e.setNotes((String) body.get("notes"));
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
