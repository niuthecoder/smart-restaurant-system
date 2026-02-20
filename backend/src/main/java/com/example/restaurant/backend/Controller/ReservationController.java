package com.example.restaurant.backend.Controller;

import com.example.restaurant.backend.DTO.ReservationByTimeDTO;
import com.example.restaurant.backend.DTO.ReservationDetailDTO;
import com.example.restaurant.backend.Entity.Reservation;
import com.example.restaurant.backend.Repository.ReservationRepository;
import com.example.restaurant.backend.Service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ReservationService reservationService;

    @PostMapping
    public Reservation createReservation(@RequestBody Reservation reservation) {
        return reservationService.createReservation(reservation);
    }

    @GetMapping
    public ResponseEntity<?> getAllReservations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (size <= 0) size = 20;
        if (size > 100) size = 100;
        Pageable pageable = PageRequest.of(page, size);
        Page<Reservation> result = reservationRepository.findAllByOrderByReservationTimeDesc(pageable);
        return ResponseEntity.ok(result);
    }

    /**
     * Returns reservations overlapping the 90-minute window starting at the given datetime.
     * Frontend uses this to disable tables that are already booked in that slot.
     */
    @GetMapping("/by-time")
    public List<ReservationByTimeDTO> getReservationsByTime(@RequestParam String datetime) {
        LocalDateTime windowStart = LocalDateTime.parse(datetime);
        return reservationService.getReservationsByTimeWindow(windowStart);
    }

    /**
     * Get reservation by code (e.g. R-20260214-8F3K). Status: PENDING | CONFIRMED | CANCELLED | NO_SHOW.
     */
    @GetMapping("/{code}")
    public ResponseEntity<ReservationDetailDTO> getByCode(@PathVariable String code) {
        return reservationService.getByCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Cancel reservation by code. Returns 404 if code not found or already CANCELLED.
     */
    @PutMapping("/{code}/cancel")
    public ResponseEntity<Reservation> cancelByCode(@PathVariable String code) {
        return reservationService.cancelByCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public void deleteReservation(@PathVariable Long id) {
        reservationRepository.deleteById(id);
    }
}
