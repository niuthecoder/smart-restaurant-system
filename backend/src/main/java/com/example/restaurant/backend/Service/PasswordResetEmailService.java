package com.example.restaurant.backend.Service;

/**
 * Sends password reset link by email. Use SendGrid when app.notification.sendgrid.api-key is set.
 */
public interface PasswordResetEmailService {

    /**
     * Send password reset email. No-op if email sending is not configured.
     *
     * @param toEmail   user's email
     * @param resetLink full URL to reset page including token (e.g. https://yoursite.com/#reset-password?token=xxx)
     */
    void sendResetEmail(String toEmail, String resetLink);
}
