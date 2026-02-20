package com.example.restaurant.backend.exception;

/**
 * Thrown when a reservation overlaps an existing 90-minute block for the same table.
 */
public class TimeSlotConflictException extends RuntimeException {

    public TimeSlotConflictException(String message) {
        super(message);
    }
}
