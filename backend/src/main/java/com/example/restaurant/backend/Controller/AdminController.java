package com.example.restaurant.backend.Controller;

import com.example.restaurant.backend.Entity.*;
import com.example.restaurant.backend.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


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

    // === DASHBOARD ANALYTICS ===
    @GetMapping("/dashboard/stats")
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        try {
            // Order statistics
            stats.put("totalOrders", orderRepository.count());
            stats.put("pendingOrders", orderRepository.countByStatus("PENDING"));
            stats.put("todayOrders", orderRepository.countTodayOrders()); // Use the default method
            stats.put("totalRevenue", orderRepository.getTotalRevenue());

            // Reservation statistics
            stats.put("totalReservations", reservationRepository.count());
            stats.put("pendingReservations", reservationRepository.countByStatus("PENDING"));
            stats.put("todayReservations", reservationRepository.countTodayReservations());

            // Menu statistics
            stats.put("totalMenuItems", menuItemRepository.count());

        } catch (Exception e) {
            // Return safe defaults if queries fail
            stats.put("totalOrders", 0);
            stats.put("pendingOrders", 0);
            stats.put("todayOrders", 0);
            stats.put("totalRevenue", 0.0);
            stats.put("totalReservations", 0);
            stats.put("pendingReservations", 0);
            stats.put("todayReservations", 0);
            stats.put("totalMenuItems", 0);
        }

        return stats;
    }
    

    // === ORDERS MANAGEMENT ===
    @GetMapping("/orders")
    public List<RestaurantOrder> getAllOrders() {
        return orderRepository.findAll();
    }

    @GetMapping("/orders/status/{status}")
    public List<RestaurantOrder> getOrdersByStatus(@PathVariable String status) {
        return orderRepository.findByStatus(status.toUpperCase());
    }

    @PutMapping("/orders/{id}/status")
    public RestaurantOrder updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        RestaurantOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(request.get("status").toUpperCase());
        return orderRepository.save(order);
    }

    // === RESERVATIONS MANAGEMENT ===
    @GetMapping("/reservations")
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    @GetMapping("/reservations/status/{status}")
    public List<Reservation> getReservationsByStatus(@PathVariable String status) {
        return reservationRepository.findByStatus(status.toUpperCase());
    }

    @PutMapping("/reservations/{id}/status")
    public Reservation updateReservationStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        reservation.setStatus(request.get("status").toUpperCase());
        return reservationRepository.save(reservation);
    }

    // === MENU MANAGEMENT ===
    @GetMapping("/menu-items")
    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }
}