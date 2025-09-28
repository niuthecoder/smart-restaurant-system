package com.example.restaurant.backend.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String guestName;
    private String guestPhone;
    private Long tableId;
    private LocalDateTime reservationTime;
    private int guestCount;

    // Add status field for admin dashboard
    private String status = "PENDING"; // "PENDING", "CONFIRMED", "SEATED", "COMPLETED", "CANCELLED"

    // Add email and special requests
    private String guestEmail;
    private String specialRequests;

    public Reservation() {
    }

    public Reservation(String guestName, String guestPhone, String guestEmail,
            Long tableId, LocalDateTime reservationTime, int guestCount,
            String specialRequests) {
        this.guestName = guestName;
        this.guestPhone = guestPhone;
        this.guestEmail = guestEmail;
        this.tableId = tableId;
        this.reservationTime = reservationTime;
        this.guestCount = guestCount;
        this.specialRequests = specialRequests;
        this.status = "PENDING";
    }

    // Getters & Setters for new fields
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getGuestEmail() {
        return guestEmail;
    }

    public void setGuestEmail(String guestEmail) {
        this.guestEmail = guestEmail;
    }

    public String getSpecialRequests() {
        return specialRequests;
    }

    public void setSpecialRequests(String specialRequests) {
        this.specialRequests = specialRequests;
    }

    // Existing getters/setters...
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getGuestName() {
        return guestName;
    }

    public void setGuestName(String guestName) {
        this.guestName = guestName;
    }

    public String getGuestPhone() {
        return guestPhone;
    }

    public void setGuestPhone(String guestPhone) {
        this.guestPhone = guestPhone;
    }

    public Long getTableId() {
        return tableId;
    }

    public void setTableId(Long tableId) {
        this.tableId = tableId;
    }

    public LocalDateTime getReservationTime() {
        return reservationTime;
    }

    public void setReservationTime(LocalDateTime reservationTime) {
        this.reservationTime = reservationTime;
    }

    public int getGuestCount() {
        return guestCount;
    }

    public void setGuestCount(int guestCount) {
        this.guestCount = guestCount;
    }
}