package com.example.restaurant.backend.Service;

import org.springframework.stereotype.Service;

/** Default no-op when SendGrid is not configured. */
@Service
public class NoOpPasswordResetEmailService implements PasswordResetEmailService {

    @Override
    public void sendResetEmail(String toEmail, String resetLink) {
        // No-op
    }
}
