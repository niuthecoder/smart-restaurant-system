package com.example.restaurant.backend.Controller;

import com.example.restaurant.backend.DTO.AuthResponse;
import com.example.restaurant.backend.DTO.LoginRequest;
import com.example.restaurant.backend.Entity.User;
import com.example.restaurant.backend.Repository.UserRepository;
import com.example.restaurant.backend.Service.PasswordResetEmailService;
import com.example.restaurant.backend.config.TenantContext;
import com.example.restaurant.backend.config.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import jakarta.annotation.PostConstruct;
import jakarta.validation.Valid;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.example.restaurant.backend.Repository.PasswordResetTokenRepository;
import com.example.restaurant.backend.Entity.PasswordResetToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Authentication", description = "User authentication APIs")

public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordResetEmailService passwordResetEmailService;

    @Value("${app.base-url:http://localhost:5173}")
    private String baseUrl;

    @Value("${app.security.create-default-users:true}")
    private boolean createDefaultUsers;

    @PostConstruct
    public void createDefaultAdminAndWaiter() {
        if (!createDefaultUsers) {
            log.info("Default user creation is disabled (app.security.create-default-users=false)");
            return;
        }
        try {
            if (userRepository.count() == 0) {
                User admin = new User();
                admin.setRestaurantId(TenantContext.DEFAULT_RESTAURANT_ID);
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setEmail("admin@burgerhouse.com");
                admin.setRole("ADMIN");
                admin.setEnabled(true);
                userRepository.save(admin);
                log.info("Default admin user created. Change password after first login.");
            }
            if (userRepository.findByUsername("waiter").isEmpty()) {
                User waiter = new User();
                waiter.setRestaurantId(TenantContext.DEFAULT_RESTAURANT_ID);
                waiter.setUsername("waiter");
                waiter.setPassword(passwordEncoder.encode("waiter123"));
                waiter.setEmail("waiter@burgerhouse.com");
                waiter.setRole("WAITER");
                waiter.setEnabled(true);
                userRepository.save(waiter);
                log.info("Default waiter user created (waiter / waiter123).");
            }
        } catch (Exception e) {
            log.error("Error creating default users: {}", e.getMessage());
        }
    }

    /** Create default waiter (only when app.security.create-default-users=true). */
    @GetMapping("/create-waiter")
    public ResponseEntity<String> createWaiter() {
        if (!createDefaultUsers) {
            return ResponseEntity.notFound().build();
        }
        try {
            if (userRepository.findByUsername("waiter").isPresent()) {
                return ResponseEntity.ok("Waiter user already exists");
            }
            User waiter = new User();
            waiter.setRestaurantId(TenantContext.DEFAULT_RESTAURANT_ID);
            waiter.setUsername("waiter");
            waiter.setPassword(passwordEncoder.encode("waiter123"));
            waiter.setEmail("waiter@burgerhouse.com");
            waiter.setRole("WAITER");
            waiter.setEnabled(true);
            userRepository.save(waiter);
            return ResponseEntity.ok("Waiter user created successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @Operation(summary = "User login", description = "Authenticate user and return JWT token")
    @ApiResponse(responseCode = "200", description = "Login successful")
    @ApiResponse(responseCode = "400", description = "Invalid credentials")
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Optional<User> userOpt = userRepository.findByUsername(loginRequest.getUsername());
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(new AuthResponse(null, null, null, "Invalid credentials"));
            }
            User user = userOpt.get();
            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                return ResponseEntity.badRequest().body(new AuthResponse(null, null, null, "Invalid credentials"));
            }
            if (!user.isEnabled()) {
                return ResponseEntity.badRequest().body(new AuthResponse(null, null, null, "Account disabled"));
            }
            String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
            return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getRole(), "Login successful"));
        } catch (Exception e) {
            log.warn("Login failed: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new AuthResponse(null, null, null, "Login failed"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody LoginRequest registerRequest) {
        try {
            if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
                return ResponseEntity.badRequest().body("Username already exists");
            }

            User user = new User();
            user.setRestaurantId(TenantContext.DEFAULT_RESTAURANT_ID);
            user.setUsername(registerRequest.getUsername());
            user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            user.setRole("ADMIN");
            user.setEnabled(true);

            userRepository.save(user);

            String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
            return ResponseEntity
                    .ok(new AuthResponse(token, user.getUsername(), user.getRole(), "Registration successful"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed");
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body != null ? body.get("email") : null;
        if (email == null || email.isBlank())
            return ResponseEntity.badRequest().body("Email required");
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty())
            return ResponseEntity.ok(Map.of("message", "If that email exists, we sent a reset link."));
        User user = userOpt.get();
        passwordResetTokenRepository.deleteByUserId(user.getId());
        String token = UUID.randomUUID().toString().replace("-", "");
        PasswordResetToken prt = new PasswordResetToken();
        prt.setUserId(user.getId());
        prt.setToken(token);
        prt.setExpiresAt(LocalDateTime.now().plusHours(1));
        passwordResetTokenRepository.save(prt);
        String resetLink = baseUrl + "/#reset-password?token=" + token;
        passwordResetEmailService.sendResetEmail(user.getEmail(), resetLink);
        return ResponseEntity.ok(Map.of("message", "If that email exists, we sent a reset link."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String token = body != null ? body.get("token") : null;
        String newPassword = body != null ? body.get("newPassword") : null;
        if (token == null || newPassword == null || newPassword.length() < 6)
            return ResponseEntity.badRequest().body("Token and new password (min 6 chars) required");
        var prtOpt = passwordResetTokenRepository.findByTokenAndUsedFalseAndExpiresAtAfter(token, LocalDateTime.now());
        if (prtOpt.isEmpty())
            return ResponseEntity.badRequest().body("Invalid or expired token");
        PasswordResetToken prt = prtOpt.get();
        User user = userRepository.findById(prt.getUserId()).orElseThrow();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        prt.setUsed(true);
        passwordResetTokenRepository.save(prt);
        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        try {
            if (token != null && token.startsWith("Bearer ")) {
                String jwt = token.substring(7);
                if (jwtUtil.validateToken(jwt)) {
                    return ResponseEntity.ok(new AuthResponse(jwt, jwtUtil.extractUsername(jwt),
                            jwtUtil.extractRole(jwt), "Token valid"));
                }
            }
            return ResponseEntity.badRequest().body("Invalid token");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Token validation failed");
        }
    }
}