package com.example.restaurant.backend.DTO;

import java.time.LocalDateTime;

/** Minimal DTO for by-time endpoint: which tables are reserved in the 90-min window. */
public class ReservationByTimeDTO {

    private Long id;
    private Long tableId;
    private LocalDateTime reservationTime;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getTableId() { return tableId; }
    public void setTableId(Long tableId) { this.tableId = tableId; }
    public LocalDateTime getReservationTime() { return reservationTime; }
    public void setReservationTime(LocalDateTime reservationTime) { this.reservationTime = reservationTime; }
}
