package com.example.restaurant.backend.Service;

import com.example.restaurant.backend.Entity.AuditLog;
import com.example.restaurant.backend.Repository.AuditLogRepository;
import com.example.restaurant.backend.config.TenantContext;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(String action, String entityType, Long entityId, String details) {
        try {
            Long restaurantId = TenantContext.getCurrentRestaurantId();
            String user = TenantContext.getCurrentUsername();
            AuditLog log = new AuditLog();
            log.setRestaurantId(restaurantId);
            log.setUserName(user != null ? user : "system");
            log.setAction(action);
            log.setEntityType(entityType);
            log.setEntityId(entityId);
            log.setDetails(details != null && details.length() > 500 ? details.substring(0, 500) : details);
            auditLogRepository.save(log);
        } catch (Exception ignored) {
            // Don't fail the main operation if audit fails
        }
    }

    public List<AuditLog> getRecent(Long restaurantId, int limit) {
        return auditLogRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId, PageRequest.of(0, limit));
    }
}
