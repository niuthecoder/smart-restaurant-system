package com.example.restaurant.backend.Controller;

import com.example.restaurant.backend.Entity.*;
import com.example.restaurant.backend.Repository.*;
import com.example.restaurant.backend.Service.AuditService;
import com.example.restaurant.backend.Service.OrderNotificationService;
import com.example.restaurant.backend.config.TenantContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private RestaurantOrderRepository orderRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private RestaurantTableRepository tableRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private AuditService auditService;

    @Autowired
    private OrderNotificationService orderNotificationService;

    @GetMapping("/dashboard/stats")
    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Map<String, Object> stats = new HashMap<>();
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = startOfToday.plusDays(1);
        LocalDateTime rangeStart = from != null ? from.atStartOfDay() : startOfToday;
        LocalDateTime rangeEnd = to != null ? to.plusDays(1).atStartOfDay() : endOfToday;

        try {
            stats.put("totalOrders", orderRepository.count());
            stats.put("pendingOrders", orderRepository.countByStatus("PENDING"));
            stats.put("todayOrders", orderRepository.countTodayOrders());
            double totalRev = orderRepository.getTotalRevenue() != null ? orderRepository.getTotalRevenue() : 0.0;
            stats.put("totalRevenue", totalRev);
            Double rangeRev = orderRepository.getRevenueBetween(rangeStart, rangeEnd);
            stats.put("revenueInRange", rangeRev != null ? rangeRev : 0.0);
            stats.put("fromDate", from != null ? from.toString() : null);
            stats.put("toDate", to != null ? to.toString() : null);

            stats.put("totalReservations", reservationRepository.count());
            stats.put("pendingReservations", reservationRepository.countByStatus("PENDING"));
            stats.put("todayReservations", reservationRepository.countTodayReservations());
            stats.put("bookingsToday", reservationRepository.countTodayReservations());

            long totalTables = tableRepository.count();
            long occupiedTables = tableRepository.findAll().stream().filter(t -> t.isOccupied()).count();
            double occupancyRate = totalTables > 0 ? (double) occupiedTables / totalTables : 0.0;
            stats.put("occupancyRate", Math.round(occupancyRate * 100.0) / 100.0);
            stats.put("occupiedTables", occupiedTables);
            stats.put("totalTables", totalTables);

            List<RestaurantOrder> todayOrders = orderRepository.findAll().stream()
                    .filter(o -> o.getOrderTime() != null && !o.getOrderTime().isBefore(startOfToday) && o.getOrderTime().isBefore(endOfToday))
                    .toList();
            java.util.Map<Integer, Long> ordersByHour = todayOrders.stream()
                    .collect(java.util.stream.Collectors.groupingBy(o -> o.getOrderTime().getHour(), java.util.stream.Collectors.counting()));
            List<Map<String, Object>> peakHours = ordersByHour.entrySet().stream()
                    .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                    .limit(5)
                    .map(e -> {
                        Map<String, Object> m = new HashMap<>();
                        m.put("hour", e.getKey());
                        m.put("count", e.getValue());
                        m.put("label", String.format("%02d:00", e.getKey()));
                        return m;
                    })
                    .toList();
            stats.put("peakHours", peakHours);

            stats.put("totalMenuItems", menuItemRepository.count());

            // Revenue by day (last 7 days) for charts
            List<Map<String, Object>> revenueByPeriod = new ArrayList<>();
            for (int i = 6; i >= 0; i--) {
                LocalDate d = LocalDate.now().minusDays(i);
                LocalDateTime dayStart = d.atStartOfDay();
                LocalDateTime dayEnd = d.plusDays(1).atStartOfDay();
                Double dayRev = orderRepository.getRevenueBetween(dayStart, dayEnd);
                Map<String, Object> entry = new HashMap<>();
                entry.put("date", d.toString());
                entry.put("revenue", dayRev != null ? dayRev : 0.0);
                revenueByPeriod.add(entry);
            }
            stats.put("revenueByPeriod", revenueByPeriod);

            // Popular items (top 10 by quantity sold from completed orders)
            List<RestaurantOrder> completed = orderRepository.findByStatus("COMPLETED");
            Map<String, long[]> nameToQty = new HashMap<>();
            for (RestaurantOrder o : completed) {
                if (o.getItems() == null) continue;
                for (OrderItem oi : o.getItems()) {
                    String name = oi.getItemName();
                    nameToQty.computeIfAbsent(name, k -> new long[]{0})[0] += oi.getQuantity();
                }
            }
            List<Map<String, Object>> popularItems = nameToQty.entrySet().stream()
                    .sorted((a, b) -> Long.compare(b.getValue()[0], a.getValue()[0]))
                    .limit(10)
                    .map(e -> {
                        Map<String, Object> m = new HashMap<>();
                        m.put("name", e.getKey());
                        m.put("quantitySold", e.getValue()[0]);
                        return m;
                    })
                    .collect(Collectors.toList());
            stats.put("popularItems", popularItems);
        } catch (Exception e) {
            stats.put("totalOrders", 0);
            stats.put("pendingOrders", 0);
            stats.put("todayOrders", 0);
            stats.put("totalRevenue", 0.0);
            stats.put("totalReservations", 0);
            stats.put("pendingReservations", 0);
            stats.put("todayReservations", 0);
            stats.put("bookingsToday", 0);
            stats.put("occupancyRate", 0.0);
            stats.put("occupiedTables", 0);
            stats.put("totalTables", 0);
            stats.put("peakHours", List.of());
            stats.put("totalMenuItems", 0);
            stats.put("revenueByPeriod", List.of());
            stats.put("popularItems", List.of());
            stats.put("revenueInRange", 0.0);
        }
        return stats;
    }

    // === ORDERS EXPORT CSV ===
    @GetMapping(value = "/orders/export", produces = "text/csv")
    public ResponseEntity<String> exportOrdersCsv(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        LocalDateTime rangeStart = from != null ? from.atStartOfDay() : LocalDateTime.of(2000, 1, 1, 0, 0);
        LocalDateTime rangeEnd = to != null ? to.plusDays(1).atStartOfDay() : LocalDateTime.now().plusYears(1);
        List<RestaurantOrder> list = orderRepository.findByOrderTimeBetween(rangeStart, rangeEnd);
        StringBuilder csv = new StringBuilder("id,tableId,customerName,orderType,status,orderTime,totalAmount\n");
        for (RestaurantOrder o : list) {
            csv.append(o.getId()).append(",")
                    .append(o.getTableId() != null ? o.getTableId() : "").append(",")
                    .append(escapeCsv(o.getCustomerName())).append(",")
                    .append(escapeCsv(o.getOrderType())).append(",")
                    .append(escapeCsv(o.getStatus())).append(",")
                    .append(o.getOrderTime() != null ? o.getOrderTime().toString() : "").append(",")
                    .append(o.getTotalAmount() != null ? o.getTotalAmount() : 0).append("\n");
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDispositionFormData("attachment", "orders.csv");
        return ResponseEntity.ok().headers(headers).contentType(MediaType.parseMediaType("text/csv")).body(csv.toString());
    }

    private static String escapeCsv(String s) {
        if (s == null) return "";
        if (s.contains(",") || s.contains("\"") || s.contains("\n")) return "\"" + s.replace("\"", "\"\"") + "\"";
        return s;
    }

    // === RESERVATIONS EXPORT CSV ===
    @GetMapping(value = "/reservations/export", produces = "text/csv")
    public ResponseEntity<String> exportReservationsCsv(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        List<Reservation> all = reservationRepository.findAllByOrderByReservationTimeDesc();
        LocalDateTime rangeStart = from != null ? from.atStartOfDay() : LocalDateTime.of(2000, 1, 1, 0, 0);
        LocalDateTime rangeEnd = to != null ? to.plusDays(1).atStartOfDay() : LocalDateTime.now().plusYears(1);
        StringBuilder csv = new StringBuilder("id,reservationCode,guestName,guestPhone,tableId,reservationTime,guestCount,status\n");
        for (Reservation r : all) {
            if (r.getReservationTime() == null) continue;
            if (r.getReservationTime().isBefore(rangeStart) || !r.getReservationTime().isBefore(rangeEnd)) continue;
            csv.append(r.getId()).append(",")
                    .append(escapeCsv(r.getReservationCode())).append(",")
                    .append(escapeCsv(r.getGuestName())).append(",")
                    .append(escapeCsv(r.getGuestPhone())).append(",")
                    .append(r.getTableId() != null ? r.getTableId() : "").append(",")
                    .append(r.getReservationTime().toString()).append(",")
                    .append(r.getGuestCount()).append(",")
                    .append(escapeCsv(r.getStatus())).append("\n");
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDispositionFormData("attachment", "reservations.csv");
        return ResponseEntity.ok().headers(headers).contentType(MediaType.parseMediaType("text/csv")).body(csv.toString());
    }

    // === ORDERS MANAGEMENT ===
    @GetMapping("/orders")
    public Page<RestaurantOrder> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (size <= 0) size = 20;
        if (size > 100) size = 100;
        return orderRepository.findAllByOrderByOrderTimeDesc(PageRequest.of(page, size));
    }

    @GetMapping("/orders/status/{status}")
    public Page<RestaurantOrder> getOrdersByStatus(@PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (size <= 0) size = 20;
        if (size > 100) size = 100;
        return orderRepository.findByStatusOrderByOrderTimeDesc(status.toUpperCase(), PageRequest.of(page, size));
    }

    @PutMapping("/orders/{id}/status")
    public RestaurantOrder updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        RestaurantOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(request.get("status").toUpperCase());
        RestaurantOrder saved = orderRepository.save(order);
        if ("READY".equals(saved.getStatus())) {
            try { orderNotificationService.sendOrderReady(saved); } catch (Exception ignored) {}
        }
        return saved;
    }

    // === MENU MANAGEMENT ===
    @GetMapping("/menu-items")
    public Page<MenuItem> getAllMenuItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        if (size <= 0) size = 50;
        if (size > 100) size = 100;
        long restaurantId = TenantContext.getCurrentRestaurantId();
        return menuItemRepository.findByRestaurantIdOrRestaurantIdIsNull(restaurantId, PageRequest.of(page, size));
    }

    // === RESTAURANT (branding + opening hours) ===
    @GetMapping("/restaurant")
    public ResponseEntity<Restaurant> getCurrentRestaurant() {
        long id = com.example.restaurant.backend.config.TenantContext.getCurrentRestaurantId();
        return restaurantRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/restaurant")
    public ResponseEntity<Restaurant> updateRestaurant(@RequestBody Map<String, Object> body) {
        long id = com.example.restaurant.backend.config.TenantContext.getCurrentRestaurantId();
        Restaurant r = restaurantRepository.findById(id).orElseThrow(() -> new RuntimeException("Restaurant not found"));
        if (body.containsKey("name")) r.setName((String) body.get("name"));
        if (body.containsKey("location")) r.setLocation((String) body.get("location"));
        if (body.containsKey("logoUrl")) r.setLogoUrl((String) body.get("logoUrl"));
        if (body.containsKey("primaryColor")) r.setPrimaryColor((String) body.get("primaryColor"));
        if (body.containsKey("supportEmail")) r.setSupportEmail((String) body.get("supportEmail"));
        if (body.containsKey("timezone")) r.setTimezone((String) body.get("timezone"));
        if (body.containsKey("openTime")) {
            String s = (String) body.get("openTime");
            r.setOpenTime(s != null && !s.isBlank() ? LocalTime.parse(s) : null);
        }
        if (body.containsKey("closeTime")) {
            String s = (String) body.get("closeTime");
            r.setCloseTime(s != null && !s.isBlank() ? LocalTime.parse(s) : null);
        }
        return ResponseEntity.ok(restaurantRepository.save(r));
    }

    @GetMapping("/audit-log")
    public List<AuditLog> getAuditLog(@RequestParam(defaultValue = "100") int limit) {
        long restaurantId = TenantContext.getCurrentRestaurantId();
        return auditService.getRecent(restaurantId, Math.min(limit, 500));
    }

    @GetMapping(value = "/menu/export", produces = "text/csv")
    public ResponseEntity<String> exportMenuCsv() {
        List<MenuItem> list = menuItemRepository.findAll();
        StringBuilder csv = new StringBuilder("id,name,category,price,available,tags\n");
        for (MenuItem m : list) {
            csv.append(m.getId()).append(",")
                    .append(escapeCsv(m.getName())).append(",")
                    .append(escapeCsv(m.getCategory())).append(",")
                    .append(m.getPrice() != null ? m.getPrice() : 0).append(",")
                    .append(m.isAvailable() ? "true" : "false").append(",")
                    .append(escapeCsv(m.getTags())).append("\n");
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDispositionFormData("attachment", "menu.csv");
        return ResponseEntity.ok().headers(headers).contentType(MediaType.parseMediaType("text/csv")).body(csv.toString());
    }
}