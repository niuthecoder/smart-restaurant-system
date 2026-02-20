package com.example.restaurant.backend.DTO;

import java.time.LocalDateTime;

/**
 * Guest-facing reservation details (by code). Status: PENDING | CONFIRMED | CANCELLED | NO_SHOW.
 */
public class ReservationDetailDTO {

    private String reservationCode;
    private String status;
    private LocalDateTime reservationTime;
    private Integer tableNumber;
    private String salon;
    private Integer guestCount;
    private String guestName;

    public String getReservationCode() { return reservationCode; }
    public void setReservationCode(String reservationCode) { this.reservationCode = reservationCode; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getReservationTime() { return reservationTime; }
    public void setReservationTime(LocalDateTime reservationTime) { this.reservationTime = reservationTime; }
    public Integer getTableNumber() { return tableNumber; }
    public void setTableNumber(Integer tableNumber) { this.tableNumber = tableNumber; }
    public String getSalon() { return salon; }
    public void setSalon(String salon) { this.salon = salon; }
    public Integer getGuestCount() { return guestCount; }
    public void setGuestCount(Integer guestCount) { this.guestCount = guestCount; }
    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }
}
