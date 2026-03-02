package com.example.restaurant.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import org.springframework.beans.factory.annotation.Value;
import com.example.restaurant.backend.Repository.ApiKeyRepository;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:5173}")
    private String corsAllowedOrigins;
    @Autowired
    private AuthRateLimitFilter authRateLimitFilter;
    @Autowired
    private PublicRateLimitFilter publicRateLimitFilter;
    @Autowired
    private ApiKeyRepository apiKeyRepository;

    @Bean
    public ApiKeyFilter apiKeyFilter() {
        return new ApiKeyFilter(apiKeyRepository);
    }

    @Bean
    public JwtTokenFilter jwtTokenFilter() {
        return new JwtTokenFilter(jwtUtil);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> {
                })
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        // Health for load balancers / monitoring
                        .requestMatchers("/actuator/health/**", "/actuator/info").permitAll()
                        .requestMatchers("/api/health").permitAll()
                        // OpenAPI / Swagger (read-only docs)
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        // Stripe webhook (no JWT; verified by signature)
                        .requestMatchers("/api/stripe/webhook").permitAll()
                        // QR table URL (public)
                        .requestMatchers(HttpMethod.GET, "/api/qr/table/**").permitAll()
                        // Public
                        .requestMatchers("/api/auth/login", "/api/auth/forgot-password", "/api/auth/reset-password").permitAll()
                        .requestMatchers("/api/auth/register", "/api/auth/create-waiter").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/auth/validate").permitAll()
                        .requestMatchers("/api/messages").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/menuitems", "/api/menuitems/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/tables", "/api/tables/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/orders").permitAll()
                        .requestMatchers(HttpMethod.GET, "/orders/*").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/reservations").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/reservations/by-time").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/reservations/*").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/reservations/*/cancel").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/reservations/*").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/availability").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/settings/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/waitlist").permitAll()
                        .requestMatchers("/api/waitlist/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/loyalty/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/loyalty/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/reviews").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/reviews").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/test-email").hasAuthority("ROLE_ADMIN")

                        // Manager: read-only dashboard, orders, reservations, exports, audit, menu export
                        .requestMatchers(HttpMethod.GET, "/api/admin/dashboard/stats", "/api/admin/orders", "/api/admin/orders/export", "/api/admin/reservations/export", "/api/admin/audit-log", "/api/admin/menu/export").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER")
                        .requestMatchers(HttpMethod.GET, "/api/admin/reservations", "/api/admin/reservations/upcoming-today").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER")
                        // Admin only (menu, order status updates, user management, api-keys, etc.)
                        .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                        // Waiter + Admin: tables and orders (kitchen flow, mark served)
                        .requestMatchers("/api/waiter/**").hasAnyAuthority("ROLE_WAITER", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/orders", "/orders/**").hasAnyAuthority("ROLE_WAITER", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/orders/complete/**").hasAnyAuthority("ROLE_WAITER", "ROLE_ADMIN")
                        .requestMatchers("/api/payments/**").hasAnyAuthority("ROLE_WAITER", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/orders/**/receipt").permitAll()

                        // MUST be last
                        .anyRequest().authenticated())
            
                .addFilterBefore(publicRateLimitFilter, org.springframework.security.web.context.SecurityContextHolderFilter.class)
                .addFilterBefore(authRateLimitFilter, org.springframework.security.web.context.SecurityContextHolderFilter.class)
                .addFilterBefore(apiKeyFilter(), UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> origins = Arrays.stream(corsAllowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
        if (origins.isEmpty()) {
            configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000"));
        } else {
            configuration.setAllowedOrigins(origins);
        }
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With", "X-API-Key"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
