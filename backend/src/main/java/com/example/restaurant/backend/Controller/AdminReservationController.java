package com.example.restaurant.backend.Controller;

import com.example.restaurant.backend.DTO.AdminReservationDTO;
import com.example.restaurant.backend.Entity.Reservation;
import com.example.restaurant.backend.Repository.ReservationRepository;
import com.example.restaurant.backend.Service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminReservationController {

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private ReservationRepository reservationRepository;

    /**
     * Admin-only. List reservations with optional filters. Latest first.
     * Params: date (YYYY-MM-DD), salon (SALON_1/SALON_2/SALON_3), status, search (name or phone).
     */
    @GetMapping("/reservations")
    public List<AdminReservationDTO> getAllReservations(
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String salon,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        LocalDate dateFilter = date != null && !date.isBlank() ? LocalDate.parse(date) : null;
        return reservationService.getAdminReservationsFiltered(dateFilter, salon, status, search);
    }

    /** Upcoming reservations today (from now until end of day), not cancelled. */
    @GetMapping("/reservations/upcoming-today")
    public List<AdminReservationDTO> getUpcomingToday() {
        return reservationService.getUpcomingToday();
    }

    @GetMapping("/reservations/status/{status}")
    public List<Reservation> getReservationsByStatus(@PathVariable String status) {
        return reservationRepository.findByStatus(status.toUpperCase());
    }

    @PutMapping("/reservations/{id}/status")
    public Reservation updateReservationStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        String status = request.get("status");
        if (status == null || status.isBlank()) throw new IllegalArgumentException("status is required");
        reservation.setStatus(status.toUpperCase());
        return reservationRepository.save(reservation);
    }

    /** Admin: mark reservation as NO_SHOW. Allowed statuses: PENDING | CONFIRMED | CANCELLED | NO_SHOW. */
    @PutMapping("/reservations/{id}/no-show")
    public Reservation markNoShow(@PathVariable Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        reservation.setStatus("NO_SHOW");
        return reservationRepository.save(reservation);
    }
}
