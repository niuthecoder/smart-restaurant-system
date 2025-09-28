package com.example.restaurant.backend.Repository;

import com.example.restaurant.backend.Entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // For admin dashboard filtering
    List<Reservation> findByStatus(String status);

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
}