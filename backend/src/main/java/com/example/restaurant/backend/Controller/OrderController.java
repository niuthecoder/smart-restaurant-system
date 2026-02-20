package com.example.restaurant.backend.Controller;

import com.example.restaurant.backend.DTO.CreateOrderRequest;
import com.example.restaurant.backend.DTO.CreateOrderItemRequest;
import com.example.restaurant.backend.Entity.MenuItem;
import com.example.restaurant.backend.Entity.OrderItem;
import com.example.restaurant.backend.Entity.RestaurantOrder;
import com.example.restaurant.backend.Repository.MenuItemRepository;
import com.example.restaurant.backend.Repository.RestaurantOrderRepository;
import com.example.restaurant.backend.Repository.RestaurantTableRepository;
import com.example.restaurant.backend.config.TenantContext;
import com.example.restaurant.backend.Service.LoyaltyService;
import com.example.restaurant.backend.Service.ReceiptService;
import com.example.restaurant.backend.Service.AuditService;
import com.example.restaurant.backend.Service.OrderNotificationService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final RestaurantOrderRepository orderRepo;
    private final MenuItemRepository menuRepo;
    private final RestaurantTableRepository tableRepo;
    private final LoyaltyService loyaltyService;
    private final ReceiptService receiptService;
    private final AuditService auditService;
    private final OrderNotificationService orderNotificationService;

    public OrderController(RestaurantOrderRepository orderRepo,
                           MenuItemRepository menuRepo,
                           RestaurantTableRepository tableRepo,
                           LoyaltyService loyaltyService,
                           ReceiptService receiptService,
                           AuditService auditService,
                           OrderNotificationService orderNotificationService) {
        this.orderRepo = orderRepo;
        this.menuRepo = menuRepo;
        this.tableRepo = tableRepo;
        this.loyaltyService = loyaltyService;
        this.receiptService = receiptService;
        this.auditService = auditService;
        this.orderNotificationService = orderNotificationService;
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CreateOrderRequest req) {
        if (req.getItems() == null || req.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body("Items are required");
        }

        RestaurantOrder order = new RestaurantOrder();
        order.setRestaurantId(TenantContext.getCurrentRestaurantId());
        order.setTableId(req.getTableId());
        order.setCustomerName(req.getCustomerName());
        order.setCustomerPhone(req.getCustomerPhone());
        order.setCustomerEmail(req.getCustomerEmail());
        order.setOrderType(req.getOrderType());
        order.setDeliveryAddress(req.getDeliveryAddress());
        order.setNotes(req.getNotes());
        order.setOrderTime(LocalDateTime.now());
        order.setStatus("PENDING");

        List<OrderItem> orderItems = new ArrayList<>();
        double total = 0.0;

        long restaurantId = TenantContext.getCurrentRestaurantId();
        for (CreateOrderItemRequest i : req.getItems()) {
            if (i.getMenuItemId() == null && (i.getMenuItemName() == null || i.getMenuItemName().isBlank()))
                return ResponseEntity.badRequest().body("menuItemId or menuItemName is required");
            if (i.getQuantity() <= 0)
                return ResponseEntity.badRequest().body("quantity must be > 0");

            MenuItem menuItem = null;
            if (i.getMenuItemId() != null) {
                menuItem = menuRepo.findById(i.getMenuItemId()).orElse(null);
            }
            if (menuItem == null && i.getMenuItemName() != null && !i.getMenuItemName().isBlank()) {
                var byName = menuRepo.findByNameForRestaurant(i.getMenuItemName().trim(), restaurantId);
                menuItem = byName.isEmpty() ? null : byName.get(0);
            }
            if (menuItem == null)
                return ResponseEntity.badRequest().body("Menu item not found: " + (i.getMenuItemId() != null ? i.getMenuItemId() : i.getMenuItemName()));

            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setMenuItem(menuItem);
            oi.setQuantity(i.getQuantity());

            // ✅ THIS IS THE FIX
            oi.setPriceAtOrder(menuItem.getPrice());

            total += oi.getSubtotal();
            orderItems.add(oi);
        }

        order.setItems(orderItems);
        order.setTotalAmount(total);

        RestaurantOrder saved = orderRepo.save(order);
        auditService.log("CREATE", "ORDER", saved.getId(), "Order created, total $" + total);
        try {
            orderNotificationService.sendOrderConfirmation(saved);
        } catch (Exception ignored) {
            // Notification is best-effort
        }
        return ResponseEntity.ok(saved);
    }

    // GET ALL ORDERS with optional pagination (default: page 0, size 20)
    @GetMapping
    public ResponseEntity<?> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (size <= 0) size = 20;
        if (size > 100) size = 100;
        Pageable pageable = PageRequest.of(page, size);
        Page<RestaurantOrder> result = orderRepo.findAllByOrderByOrderTimeDesc(pageable);
        return ResponseEntity.ok(result);
    }

    // GET SINGLE ORDER
    @GetMapping("/{id}")
    public ResponseEntity<RestaurantOrder> getOrderById(@PathVariable Long id) {
        return orderRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET RECEIPT (HTML)
    @GetMapping(value = "/{id}/receipt", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> getReceipt(@PathVariable Long id) {
        return orderRepo.findById(id)
                .map(order -> ResponseEntity.ok(receiptService.toHtml(order)))
                .orElse(ResponseEntity.notFound().build());
    }

    // COMPLETE ORDER AND FREE TABLE (optional tip in body: { "tipAmount": 2.50 })
    @PutMapping("/complete/{id}")
    public ResponseEntity<RestaurantOrder> completeOrder(@PathVariable Long id,
                                                        @RequestBody(required = false) java.util.Map<String, Object> body) {
        return orderRepo.findById(id)
                .map(order -> {
                    order.setStatus("COMPLETED");
                    if (body != null && body.containsKey("tipAmount")) {
                        Object t = body.get("tipAmount");
                        if (t != null) order.setTipAmount(((Number) t).doubleValue());
                    }
                    if (order.getTableId() != null) {
                        tableRepo.findById(order.getTableId()).ifPresent(table -> {
                            table.setOccupied(false);
                            tableRepo.save(table);
                        });
                    }
                    RestaurantOrder saved = orderRepo.save(order);
                    auditService.log("COMPLETE", "ORDER", saved.getId(), "Order completed");
                    try { loyaltyService.addPointsForOrder(saved); } catch (Exception ignored) {}
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE ORDER
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        if (!orderRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        orderRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    
}
