package com.example.restaurant.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Rate limit for public write endpoints: reservations, orders, waitlist, reviews, loyalty, messages.
 * 30 requests per minute per IP to reduce abuse.
 */
@Component
@Order(0)
public class PublicRateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_PER_MINUTE = 30;
    private static final long WINDOW_MS = 60_000;
    private static final long CLEANUP_INTERVAL_MS = 300_000;

    private final ConcurrentHashMap<String, Window> perIp = new ConcurrentHashMap<>();
    private volatile long lastCleanup = System.currentTimeMillis();

    private static final java.util.Set<String> RATE_LIMITED_PATHS = java.util.Set.of(
            "/api/reservations",
            "/orders",
            "/api/waitlist",
            "/api/reviews",
            "/api/loyalty/redeem",
            "/api/messages"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }
        String uri = request.getRequestURI();
        boolean limited = RATE_LIMITED_PATHS.stream().anyMatch(p -> uri != null && uri.endsWith(p));
        if (!limited) {
            filterChain.doFilter(request, response);
            return;
        }

        cleanupStaleEntries();

        String key = clientKey(request);
        Window w = perIp.computeIfAbsent(key, k -> new Window());
        if (!w.allow()) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"TOO_MANY_REQUESTS\",\"message\":\"Too many requests. Try again later.\"}");
            return;
        }
        filterChain.doFilter(request, response);
    }

    private String clientKey(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();
        return request.getRemoteAddr();
    }

    private void cleanupStaleEntries() {
        long now = System.currentTimeMillis();
        if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
            lastCleanup = now;
            perIp.entrySet().removeIf(e -> now - e.getValue().windowStart > WINDOW_MS * 5);
        }
    }

    private static class Window {
        private final AtomicInteger count = new AtomicInteger(0);
        private volatile long windowStart = System.currentTimeMillis();

        boolean allow() {
            long now = System.currentTimeMillis();
            if (now - windowStart > WINDOW_MS) {
                windowStart = now;
                count.set(0);
            }
            return count.incrementAndGet() <= MAX_PER_MINUTE;
        }
    }
}
