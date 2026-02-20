package com.example.restaurant.backend.Repository;

import com.example.restaurant.backend.Entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    boolean existsByTableIdAndReservationTime(Long tableId, LocalDateTime reservationTime);
    boolean existsByReservationCode(String reservationCode);
    Optional<Reservation> findByReservationCode(String reservationCode);

    /**
     * Reservations for the given table whose 90-min window overlaps [newStart, newEnd).
     * Overlap: existingStart < newEnd AND existingStart + 90min > newStart.
     * So existingStart in (newStart - 90min, newEnd). Excludes CANCELLED.
     */
    @Query("SELECT r FROM Reservation r WHERE r.tableId = :tableId " +
            "AND (r.status IS NULL OR r.status <> 'CANCELLED') " +
            "AND r.reservationTime < :newEnd " +
            "AND r.reservationTime > :newStartMinus90")
    List<Reservation> findOverlappingForTable(
            @Param("tableId") Long tableId,
            @Param("newEnd") LocalDateTime newEnd,
            @Param("newStartMinus90") LocalDateTime newStartMinus90);

    /**
     * All reservations (any table) overlapping the 90-minute window [windowStart, windowStart+90).
     * Used by /api/reservations/by-time.
     */
    @Query("SELECT r FROM Reservation r WHERE (r.status IS NULL OR r.status <> 'CANCELLED') " +
            "AND r.reservationTime < :windowEnd " +
            "AND r.reservationTime > :windowStartMinus90")
    List<Reservation> findReservationsOverlappingWindow(
            @Param("windowEnd") LocalDateTime windowEnd,
            @Param("windowStartMinus90") LocalDateTime windowStartMinus90);

    List<Reservation> findAllByOrderByReservationTimeDesc();

    Page<Reservation> findAllByOrderByReservationTimeDesc(Pageable pageable);

    // For admin dashboard filtering
    List<Reservation> findByStatus(String status);

    List<Reservation> findByReservationTime(LocalDateTime reservationTime);

    // Count reservations by status
    Long countByStatus(String status);

    // FIXED: Get today's reservations
    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.reservationTime >= :startOfDay AND r.reservationTime < :startOfNextDay")
    Long countTodayReservations(@Param("startOfDay") LocalDateTime startOfDay,
            @Param("startOfNextDay") LocalDateTime startOfNextDay);

    // Helper method
    default Long countTodayReservations() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime startOfNextDay = startOfDay.plusDays(1);
        return countTodayReservations(startOfDay, startOfNextDay);
    }

    List<Reservation> findByReservationTimeBetween(LocalDateTime start, LocalDateTime end);
    List<Reservation> findByTableIdIn(List<Long> tableIds);
    List<Reservation> findByGuestNameContainingIgnoreCaseOrGuestPhoneContaining(String name, String phone);

    @Query("SELECT r FROM Reservation r WHERE r.reservationTime >= :now AND r.reservationTime < :endOfDay " +
            "AND (r.status IS NULL OR r.status <> 'CANCELLED') ORDER BY r.reservationTime ASC")
    List<Reservation> findUpcomingToday(@Param("now") LocalDateTime now, @Param("endOfDay") LocalDateTime endOfDay);
}