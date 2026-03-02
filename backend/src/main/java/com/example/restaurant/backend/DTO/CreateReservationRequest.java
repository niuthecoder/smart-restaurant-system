package com.example.restaurant.backend.DTO;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class CreateReservationRequest {

    @NotNull(message = "Table ID is required")
    private Long tableId;

    @NotNull(message = "Reservation time is required")
    private LocalDateTime reservationTime;

    @NotBlank(message = "Guest name is required")
    @Size(max = 200, message = "Guest name must be at most 200 characters")
    private String guestName;

    @NotBlank(message = "Guest phone is required")
    @Size(max = 50, message = "Phone must be at most 50 characters")
    private String guestPhone;

    @Size(max = 255, message = "Email must be at most 255 characters")
    private String guestEmail;

    @Min(value = 1, message = "Guest count must be at least 1")
    @Max(value = 20, message = "Guest count must be at most 20")
    private int guestCount = 1;

    @Size(max = 1000, message = "Special requests must be at most 1000 characters")
    private String specialRequests;

    public Long getTableId() { return tableId; }
    public void setTableId(Long tableId) { this.tableId = tableId; }

    public LocalDateTime getReservationTime() { return reservationTime; }
    public void setReservationTime(LocalDateTime reservationTime) { this.reservationTime = reservationTime; }

    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }

    public String getGuestPhone() { return guestPhone; }
    public void setGuestPhone(String guestPhone) { this.guestPhone = guestPhone; }

    public String getGuestEmail() { return guestEmail; }
    public void setGuestEmail(String guestEmail) { this.guestEmail = guestEmail; }

    public int getGuestCount() { return guestCount; }
    public void setGuestCount(int guestCount) { this.guestCount = guestCount; }

    public String getSpecialRequests() { return specialRequests; }
    public void setSpecialRequests(String specialRequests) { this.specialRequests = specialRequests; }
}
