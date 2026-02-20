package com.example.restaurant.backend.exception;

/**
 * Thrown when a reservation cannot be created due to double-booking
 * or time-window overlap (same table already booked within 90-minute window).
 */
public class ReservationConflictException extends RuntimeException {

    public ReservationConflictException(String message) {
        super(message);
    }

    public ReservationConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}
