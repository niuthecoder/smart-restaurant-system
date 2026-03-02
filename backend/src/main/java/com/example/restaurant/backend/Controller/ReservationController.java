package com.example.restaurant.backend.Controller;

import com.example.restaurant.backend.DTO.CreateReservationRequest;
import com.example.restaurant.backend.DTO.ReservationByTimeDTO;
import com.example.restaurant.backend.DTO.ReservationDetailDTO;
import com.example.restaurant.backend.Entity.Reservation;
import com.example.restaurant.backend.Repository.ReservationRepository;
import com.example.restaurant.backend.Service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@Tag(name = "Reservations", description = "Table reservation management")
@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ReservationService reservationService;

    @Operation(summary = "Create a reservation", description = "Books a table for the given date/time and guest info. Validates overlap, past-time, and opening hours.")
    @ApiResponse(responseCode = "200", description = "Reservation created with confirmation code")
    @ApiResponse(responseCode = "400", description = "Validation error (missing fields or bad values)")
    @ApiResponse(responseCode = "409", description = "Time-slot conflict or table already booked")
    @PostMapping
    public Reservation createReservation(@Valid @RequestBody CreateReservationRequest req) {
        Reservation reservation = new Reservation();
        reservation.setTableId(req.getTableId());
        reservation.setReservationTime(req.getReservationTime());
        reservation.setGuestName(req.getGuestName());
        reservation.setGuestPhone(req.getGuestPhone());
        reservation.setGuestEmail(req.getGuestEmail());
        reservation.setGuestCount(req.getGuestCount());
        reservation.setSpecialRequests(req.getSpecialRequests());
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
