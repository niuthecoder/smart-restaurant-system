package com.example.restaurant.backend.Service;

import com.example.restaurant.backend.DTO.AdminReservationDTO;
import com.example.restaurant.backend.DTO.ReservationByTimeDTO;
import com.example.restaurant.backend.DTO.ReservationDetailDTO;
import com.example.restaurant.backend.Entity.Reservation;
import com.example.restaurant.backend.Repository.ReservationRepository;
import com.example.restaurant.backend.Repository.RestaurantTableRepository;
import com.example.restaurant.backend.exception.TimeSlotConflictException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import com.example.restaurant.backend.DTO.AvailableTableDTO;
import com.example.restaurant.backend.Entity.Restaurant;
import com.example.restaurant.backend.Entity.RestaurantTable;
import com.example.restaurant.backend.Repository.RestaurantRepository;
import com.example.restaurant.backend.config.TenantContext;

@Service
public class ReservationService {

    public static final int RESERVATION_DURATION_MINUTES = 90;

    private final ReservationRepository reservationRepository;
    private final RestaurantTableRepository tableRepository;
    private final RestaurantRepository restaurantRepository;
    private final ReservationCodeGenerator codeGenerator;
    private final ReservationNotificationService notificationService;

    public ReservationService(ReservationRepository reservationRepository,
                             RestaurantTableRepository tableRepository,
                             RestaurantRepository restaurantRepository,
                             ReservationCodeGenerator codeGenerator,
                             ReservationNotificationService notificationService) {
        this.reservationRepository = reservationRepository;
        this.tableRepository = tableRepository;
        this.restaurantRepository = restaurantRepository;
        this.codeGenerator = codeGenerator;
        this.notificationService = notificationService;
    }

    /** Current time in the restaurant's timezone (so "now" matches the restaurant clock, not the server). */
    private LocalDateTime nowInRestaurantTime(long restaurantId) {
        Restaurant r = restaurantRepository.findById(restaurantId).orElse(null);
        if (r != null && r.getTimezone() != null && !r.getTimezone().isBlank()) {
            try {
                return ZonedDateTime.now(ZoneId.of(r.getTimezone())).toLocalDateTime();
            } catch (Exception ignored) {
                // invalid timezone, fall back to server
            }
        }
        return LocalDateTime.now();
    }

    /**
     * Creates a reservation with 90-minute time-window overlap check.
     * DB unique (table_id, reservation_time) provides hard double-booking protection;
     * DataIntegrityViolationException is handled by GlobalExceptionHandler → 409 TABLE_ALREADY_BOOKED.
     */
    @Transactional
    public Reservation createReservation(Reservation reservation) {
        if (reservation.getTableId() == null || reservation.getReservationTime() == null) {
            throw new IllegalArgumentException("tableId and reservationTime are required");
        }

        LocalDateTime newStart = reservation.getReservationTime();
        LocalDateTime newEnd = newStart.plusMinutes(RESERVATION_DURATION_MINUTES);
        LocalDateTime newStartMinus90 = newStart.minusMinutes(RESERVATION_DURATION_MINUTES);

        List<Reservation> overlapping = reservationRepository.findOverlappingForTable(
                reservation.getTableId(), newEnd, newStartMinus90);

        if (!overlapping.isEmpty()) {
            throw new TimeSlotConflictException("This table is already reserved within this time window.");
        }

        long restaurantId = reservation.getRestaurantId() != null ? reservation.getRestaurantId() : TenantContext.getCurrentRestaurantId();
        LocalDateTime now = nowInRestaurantTime(restaurantId);

        if (!newStart.isAfter(now)) {
            throw new TimeSlotConflictException("Cannot book a table in the past. Please choose a future time.");
        }

        // If the table is currently occupied (e.g. walk-in) and the reservation is soon, reject to avoid conflict
        RestaurantTable table = tableRepository.findById(reservation.getTableId()).orElse(null);
        if (table != null && table.isOccupied()) {
            if (!newStart.isAfter(now.plusMinutes(RESERVATION_DURATION_MINUTES))) {
                throw new TimeSlotConflictException("This table is currently in use. Please choose a later time or another table.");
            }
        }

        if (reservation.getStatus() == null || reservation.getStatus().isBlank()) {
            reservation.setStatus("PENDING");
        }
        if (reservation.getCreatedBy() == null || reservation.getCreatedBy().isBlank()) {
            reservation.setCreatedBy("GUEST");
        }
        if (reservation.getRestaurantId() == null) {
            reservation.setRestaurantId(TenantContext.getCurrentRestaurantId());
        }

        String code = codeGenerator.generate(reservation.getReservationTime());
        reservation.setReservationCode(code);

        Reservation saved = reservationRepository.save(reservation);

        try {
            notificationService.sendConfirmation(saved);
        } catch (Exception e) {
            // Log but do not fail the request; notification is best-effort
            org.slf4j.LoggerFactory.getLogger(ReservationService.class)
                    .warn("Reservation confirmation notification failed for {}: {}", code, e.getMessage());
        }

        return saved;
    }

    /**
     * Tables available for the 90-minute window starting at the given date and time.
     * Respects restaurant opening hours (openTime/closeTime) when set.
     */
    public List<AvailableTableDTO> getAvailableTables(LocalDate date, LocalTime time) {
        long restaurantId = TenantContext.getCurrentRestaurantId();
        Restaurant restaurant = restaurantRepository.findById(restaurantId).orElse(null);
        if (restaurant != null) {
            if (restaurant.getOpenTime() != null && time.isBefore(restaurant.getOpenTime())) {
                return List.of();
            }
            LocalTime slotEnd = time.plusMinutes(RESERVATION_DURATION_MINUTES);
            if (restaurant.getCloseTime() != null && (slotEnd.isAfter(restaurant.getCloseTime()) || !time.isBefore(restaurant.getCloseTime()))) {
                return List.of();
            }
        }

        LocalDateTime windowStart = LocalDateTime.of(date, time);
        LocalDateTime now = nowInRestaurantTime(restaurantId);

        if (!windowStart.isAfter(now)) {
            return List.of();
        }

        List<Reservation> overlapping = reservationRepository.findReservationsOverlappingWindow(
                windowStart.plusMinutes(RESERVATION_DURATION_MINUTES),
                windowStart.minusMinutes(RESERVATION_DURATION_MINUTES));
        Set<Long> reservedTableIds = overlapping.stream()
                .map(Reservation::getTableId)
                .filter(id -> id != null)
                .collect(Collectors.toSet());

        boolean slotIsSoon = !windowStart.isAfter(now.plusMinutes(RESERVATION_DURATION_MINUTES));

        List<RestaurantTable> tenantTables = tableRepository.findByRestaurantIdOrRestaurantIdIsNull(restaurantId);
        return tenantTables.stream()
                .filter(t -> !reservedTableIds.contains(t.getId()))
                .filter(t -> !slotIsSoon || !t.isOccupied())
                .map(this::toAvailableTableDTO)
                .collect(Collectors.toList());
    }

    private AvailableTableDTO toAvailableTableDTO(RestaurantTable t) {
        AvailableTableDTO dto = new AvailableTableDTO();
        dto.setId(t.getId());
        dto.setNumber(t.getNumber());
        dto.setCapacity(t.getCapacity());
        dto.setSalon(t.getSalon());
        dto.setSmokingAllowed(t.isSmokingAllowed());
        return dto;
    }

    /**
     * Reservations overlapping the 90-minute window starting at the given datetime.
     * Used by GET /api/reservations/by-time.
     */
    public List<ReservationByTimeDTO> getReservationsByTimeWindow(LocalDateTime windowStart) {
        LocalDateTime windowEnd = windowStart.plusMinutes(RESERVATION_DURATION_MINUTES);
        LocalDateTime windowStartMinus90 = windowStart.minusMinutes(RESERVATION_DURATION_MINUTES);
        List<Reservation> list = reservationRepository.findReservationsOverlappingWindow(windowEnd, windowStartMinus90);
        return list.stream().map(r -> {
            ReservationByTimeDTO dto = new ReservationByTimeDTO();
            dto.setId(r.getId());
            dto.setTableId(r.getTableId());
            dto.setReservationTime(r.getReservationTime());
            return dto;
        }).collect(Collectors.toList());
    }

    /** Get reservation by code for guest lookup. Returns empty if not found. */
    public Optional<ReservationDetailDTO> getByCode(String code) {
        return reservationRepository.findByReservationCode(code)
                .map(this::toDetailDTO);
    }

    /** Cancel reservation by code. Returns empty if not found, or if already CANCELLED. */
    @Transactional
    public Optional<Reservation> cancelByCode(String code) {
        return reservationRepository.findByReservationCode(code)
                .filter(r -> !"CANCELLED".equalsIgnoreCase(r.getStatus()))
                .map(r -> {
                    r.setStatus("CANCELLED");
                    return reservationRepository.save(r);
                });
    }

    private ReservationDetailDTO toDetailDTO(Reservation r) {
        ReservationDetailDTO dto = new ReservationDetailDTO();
        dto.setReservationCode(r.getReservationCode());
        dto.setStatus(r.getStatus());
        dto.setReservationTime(r.getReservationTime());
        dto.setGuestCount(r.getGuestCount());
        dto.setGuestName(r.getGuestName());
        if (r.getTableId() != null) {
            tableRepository.findById(r.getTableId()).ifPresent(t -> {
                dto.setTableNumber(t.getNumber());
                dto.setSalon(t.getSalon());
            });
        }
        return dto;
    }

    public List<AdminReservationDTO> getAdminReservations() {
        return getAdminReservationsFiltered(null, null, null, null);
    }

    /** Admin list with optional filters: date (YYYY-MM-DD), salon, status, search (name/phone). */
    public List<AdminReservationDTO> getAdminReservationsFiltered(
            LocalDate date, String salon, String status, String search) {
        List<Reservation> reservations;
        if (search != null && !search.isBlank()) {
            reservations = reservationRepository.findByGuestNameContainingIgnoreCaseOrGuestPhoneContaining(search.trim(), search.trim());
        } else {
            reservations = reservationRepository.findAllByOrderByReservationTimeDesc();
        }
        if (date != null) {
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.plusDays(1).atStartOfDay();
            reservations = reservations.stream()
                    .filter(r -> r.getReservationTime() != null && !r.getReservationTime().isBefore(start) && r.getReservationTime().isBefore(end))
                    .collect(Collectors.toList());
        }
        if (salon != null && !salon.isBlank()) {
            List<Long> tableIds = tableRepository.findBySalon(salon).stream().map(RestaurantTable::getId).collect(Collectors.toList());
            reservations = reservations.stream()
                    .filter(r -> r.getTableId() != null && tableIds.contains(r.getTableId()))
                    .collect(Collectors.toList());
        }
        if (status != null && !status.isBlank()) {
            reservations = reservations.stream()
                    .filter(r -> status.equalsIgnoreCase(r.getStatus()))
                    .collect(Collectors.toList());
        }
        return reservations.stream()
                .sorted(Comparator.comparing(Reservation::getReservationTime, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(this::toAdminDTO)
                .collect(Collectors.toList());
    }

    /** Upcoming reservations for today (from now until end of day), not cancelled. */
    public List<AdminReservationDTO> getUpcomingToday() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endOfDay = LocalDate.now().plusDays(1).atStartOfDay();
        List<Reservation> list = reservationRepository.findUpcomingToday(now, endOfDay);
        return list.stream().map(this::toAdminDTO).collect(Collectors.toList());
    }

    private AdminReservationDTO toAdminDTO(Reservation r) {
        AdminReservationDTO dto = new AdminReservationDTO();
        dto.setId(r.getId());
        dto.setGuestName(r.getGuestName());
        dto.setGuestPhone(r.getGuestPhone());
        dto.setGuestEmail(r.getGuestEmail());
        dto.setTableId(r.getTableId());
        dto.setReservationTime(r.getReservationTime());
        dto.setGuestCount(r.getGuestCount());
        dto.setStatus(r.getStatus());
        dto.setSpecialRequests(r.getSpecialRequests());
        dto.setReservationCode(r.getReservationCode());
        dto.setCreatedAt(r.getCreatedAt());
        dto.setUpdatedAt(r.getUpdatedAt());
        dto.setCreatedBy(r.getCreatedBy());
        if (r.getTableId() != null) {
            tableRepository.findById(r.getTableId()).ifPresent(t -> {
                dto.setTableNumber(t.getNumber());
                dto.setSalon(t.getSalon());
                dto.setSmokingAllowed(t.isSmokingAllowed());
            });
        }
        return dto;
    }
}
