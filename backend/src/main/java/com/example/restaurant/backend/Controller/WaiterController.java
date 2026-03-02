package com.example.restaurant.backend.Controller;

import com.example.restaurant.backend.DTO.CreateOrderItemRequest;
import com.example.restaurant.backend.DTO.CreateOrderRequest;
import com.example.restaurant.backend.Entity.MenuItem;
import com.example.restaurant.backend.Entity.OrderItem;
import com.example.restaurant.backend.Entity.RestaurantOrder;
import com.example.restaurant.backend.Entity.RestaurantTable;
import com.example.restaurant.backend.Repository.MenuItemRepository;
import com.example.restaurant.backend.Repository.RestaurantOrderRepository;
import com.example.restaurant.backend.Repository.RestaurantTableRepository;
import com.example.restaurant.backend.config.TenantContext;
import com.example.restaurant.backend.Service.OrderNotificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Tag(name = "Waiter", description = "Waiter & kitchen order management")
@RestController
@RequestMapping("/api/waiter")
public class WaiterController {

    private final RestaurantOrderRepository orderRepo;
    private final RestaurantTableRepository tableRepo;
    private final MenuItemRepository menuRepo;
    private final OrderNotificationService orderNotificationService;

    public WaiterController(RestaurantOrderRepository orderRepo,
            RestaurantTableRepository tableRepo,
            MenuItemRepository menuRepo,
            OrderNotificationService orderNotificationService) {
        this.orderRepo = orderRepo;
        this.tableRepo = tableRepo;
        this.menuRepo = menuRepo;
        this.orderNotificationService = orderNotificationService;
    }

    @GetMapping("/tables")
    public List<RestaurantTable> getAllTables() {
        return tableRepo.findByRestaurantIdOrRestaurantIdIsNull(TenantContext.getCurrentRestaurantId());
    }

    /** Kitchen + waiter: orders in PENDING, PREPARING, or READY (not yet COMPLETED). */
    @GetMapping("/orders/active")
    public List<RestaurantOrder> getActiveOrders() {
        return orderRepo.findByStatusNot("COMPLETED");
    }

    /** Kitchen: progress order PENDING → PREPARING → READY. Only PREPARING and READY allowed. */
    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        String status = body != null ? body.get("status") : null;
        if (status == null || status.isBlank())
            return ResponseEntity.badRequest().body("status required");
        status = status.toUpperCase();
        if (!"PREPARING".equals(status) && !"READY".equals(status))
            return ResponseEntity.badRequest().body("Only PREPARING or READY allowed");
        RestaurantOrder order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        RestaurantOrder saved = orderRepo.save(order);
        if ("READY".equals(status)) {
            try { orderNotificationService.sendOrderReady(saved); } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@Valid @RequestBody CreateOrderRequest req) {
        if (req.getTableId() == null)
            return ResponseEntity.badRequest().body("tableId is required");
        if (req.getItems() == null || req.getItems().isEmpty())
            return ResponseEntity.badRequest().body("items are required");

        RestaurantTable table = tableRepo.findById(req.getTableId())
                .orElseThrow(() -> new IllegalArgumentException("Table not found: " + req.getTableId()));

        // mark occupied
        table.setOccupied(true);
        tableRepo.save(table);

        RestaurantOrder order = new RestaurantOrder();
        order.setRestaurantId(TenantContext.getCurrentRestaurantId());
        order.setTableId(req.getTableId());
        order.setCustomerName(req.getCustomerName());
        order.setCustomerPhone(req.getCustomerPhone());
        order.setOrderType(req.getOrderType());
        order.setDeliveryAddress(req.getDeliveryAddress());
        order.setOrderTime(LocalDateTime.now());
        order.setStatus("PENDING");

        List<OrderItem> orderItems = new ArrayList<>();
        double total = 0.0;

        for (CreateOrderItemRequest i : req.getItems()) {
            if (i.getMenuItemId() == null)
                return ResponseEntity.badRequest().body("menuItemId is required");
            if (i.getQuantity() <= 0)
                return ResponseEntity.badRequest().body("quantity must be > 0");

            MenuItem menuItem = menuRepo.findById(i.getMenuItemId())
                    .orElseThrow(() -> new IllegalArgumentException("Menu item not found: " + i.getMenuItemId()));

            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setMenuItem(menuItem);
            oi.setQuantity(i.getQuantity());

            // ✅ use current menu price
            oi.setPriceAtOrder(menuItem.getPrice());

            total += oi.getSubtotal();
            orderItems.add(oi);
        }

        order.setItems(orderItems);
        order.setTotalAmount(total);

        return ResponseEntity.ok(orderRepo.save(order));
    }
}
