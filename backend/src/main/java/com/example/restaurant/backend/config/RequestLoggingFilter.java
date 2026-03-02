package com.example.restaurant.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Logs every HTTP request with method, URI, status, and duration.
 * Runs after RequestIdFilter so the MDC requestId is available.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        long start = System.currentTimeMillis();
        try {
            chain.doFilter(request, response);
        } finally {
            long ms = System.currentTimeMillis() - start;
            int status = response.getStatus();
            if (status >= 500) {
                log.error("{} {} {} {}ms", request.getMethod(), request.getRequestURI(), status, ms);
            } else if (status >= 400) {
                log.warn("{} {} {} {}ms", request.getMethod(), request.getRequestURI(), status, ms);
            } else {
                log.info("{} {} {} {}ms", request.getMethod(), request.getRequestURI(), status, ms);
            }
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return uri.startsWith("/actuator") || uri.equals("/api/health");
    }
}
