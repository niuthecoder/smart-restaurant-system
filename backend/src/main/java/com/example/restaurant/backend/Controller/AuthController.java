package com.example.restaurant.backend.Controller;

import com.example.restaurant.backend.DTO.AuthResponse;
import com.example.restaurant.backend.DTO.LoginRequest;
import com.example.restaurant.backend.Entity.User;
import com.example.restaurant.backend.Repository.UserRepository;
import com.example.restaurant.backend.config.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import jakarta.annotation.PostConstruct;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Authentication", description = "User authentication APIs")

public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;
    
    @GetMapping("/test-password")
    public ResponseEntity<String> testPassword() {
        String rawPassword = "admin123";
        String encoded = passwordEncoder.encode(rawPassword);
        boolean matches = passwordEncoder.matches(rawPassword, encoded);

        return ResponseEntity.ok("Raw: " + rawPassword +
                " | Encoded: " + encoded +
                " | Matches: " + matches);
    }

    @PostConstruct
    public void createDefaultAdmin() {
        try {
            System.out.println("🔄 Checking for default admin user...");
            long userCount = userRepository.count();
            System.out.println("📊 Current user count: " + userCount);

            if (userCount == 0) {
                System.out.println("👤 Creating default admin user...");

                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setEmail("admin@burgerhouse.com");
                admin.setRole("ADMIN");
                admin.setEnabled(true);

                User savedUser = userRepository.save(admin);
                System.out.println("✅ Default admin user created successfully!");
                System.out.println("📝 User ID: " + savedUser.getId());
                System.out.println("👤 Username: admin");
                System.out.println("🔑 Password: admin123");
                System.out.println("🎯 Role: ADMIN");
            } else {
                System.out.println("ℹ️ Users already exist in database");
                // List all existing users
                List<User> users = userRepository.findAll();
                users.forEach(user -> {
                    System.out.println("👤 Existing user: " + user.getUsername() +
                            " (Role: " + user.getRole() + ", Enabled: " + user.isEnabled() + ")");
                });
            }
        } catch (Exception e) {
            System.out.println("❌ Error creating default admin: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    @Operation(summary = "User login", description = "Authenticate user and return JWT token")
    @ApiResponse(responseCode = "200", description = "Login successful")
    @ApiResponse(responseCode = "400", description = "Invalid credentials")
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            System.out.println("🔐 Login attempt received:");
            System.out.println("Username: " + loginRequest.getUsername());
            System.out.println("Password: " + loginRequest.getPassword());

            Optional<User> userOpt = userRepository.findByUsername(loginRequest.getUsername());

            if (userOpt.isEmpty()) {
                System.out.println("❌ User not found: " + loginRequest.getUsername());
                return ResponseEntity.badRequest().body(new AuthResponse(null, null, null, "Invalid credentials"));
            }

            User user = userOpt.get();
            System.out.println("✅ User found: " + user.getUsername() + ", Role: " + user.getRole());

            // Debug password matching
            String rawPassword = loginRequest.getPassword();
            String storedPassword = user.getPassword();
            boolean passwordMatches = passwordEncoder.matches(rawPassword, storedPassword);

            System.out.println("🔑 Password match: " + passwordMatches);
            System.out.println("Raw input: " + rawPassword);
            System.out.println("Stored hash: " + storedPassword);

            if (!passwordMatches) {
                System.out.println("❌ Password mismatch for user: " + user.getUsername());
                return ResponseEntity.badRequest().body(new AuthResponse(null, null, null, "Invalid credentials"));
            }

            if (!user.isEnabled()) {
                System.out.println("❌ Account disabled for user: " + user.getUsername());
                return ResponseEntity.badRequest().body(new AuthResponse(null, null, null, "Account disabled"));
            }

            String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
            System.out.println("✅ Login successful, token generated for: " + user.getUsername());

            return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getRole(), "Login successful"));

        } catch (Exception e) {
            System.out.println("💥 Exception during login: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new AuthResponse(null, null, null, "Login failed: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody LoginRequest registerRequest) {
        try {
            if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
                return ResponseEntity.badRequest().body("Username already exists");
            }

            User user = new User();
            user.setUsername(registerRequest.getUsername());
            user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            user.setRole("ADMIN"); // First user becomes admin
            user.setEnabled(true);

            userRepository.save(user);

            String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
            return ResponseEntity
                    .ok(new AuthResponse(token, user.getUsername(), user.getRole(), "Registration successful"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed");
        }
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