package com.example.restaurant.backend.config;

import com.example.restaurant.backend.exception.TimeSlotConflictException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private Map<String, Object> errorBody(String error, String message, int status) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", status);
        body.put("error", error);
        body.put("message", message);
        return body;
    }

    @ExceptionHandler(TimeSlotConflictException.class)
    public ResponseEntity<Map<String, Object>> handleTimeSlotConflict(TimeSlotConflictException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(errorBody("TIME_SLOT_CONFLICT", ex.getMessage(), 409));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.warn("Data integrity violation: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(errorBody("DATA_INTEGRITY_VIOLATION", "This table is already booked for that time.", 409));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = ex.getBindingResult().getAllErrors().stream()
                .filter(e -> e instanceof FieldError)
                .map(e -> (FieldError) e)
                .collect(Collectors.toMap(
                        FieldError::getField,
                        e -> e.getDefaultMessage() != null ? e.getDefaultMessage() : "invalid",
                        (a, b) -> a
                ));
        Map<String, Object> body = errorBody("VALIDATION_ERROR", "One or more fields are invalid.", 400);
        body.put("fields", fieldErrors);
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleUnreadable(HttpMessageNotReadableException ex) {
        log.debug("Malformed request body: {}", ex.getMessage());
        return ResponseEntity.badRequest()
                .body(errorBody("BAD_REQUEST", "Malformed or missing request body.", 400));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<Map<String, Object>> handleMissingParam(MissingServletRequestParameterException ex) {
        String msg = "Required parameter '" + ex.getParameterName() + "' is missing.";
        return ResponseEntity.badRequest()
                .body(errorBody("MISSING_PARAMETER", msg, 400));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        Class<?> requiredType = ex.getRequiredType();
        String msg = "Parameter '" + ex.getName() + "' must be of type " +
                (requiredType != null ? requiredType.getSimpleName() : "unknown") + ".";
        return ResponseEntity.badRequest()
                .body(errorBody("TYPE_MISMATCH", msg, 400));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest()
                .body(errorBody("BAD_REQUEST", ex.getMessage(), 400));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAllExceptions(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorBody("INTERNAL_SERVER_ERROR", "An unexpected error occurred. Please try again later.", 500));
    }
}
