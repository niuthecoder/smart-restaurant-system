package com.example.restaurant.backend.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
public class RestaurantOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "restaurant_id")
    private Long restaurantId;

    private Long tableId;

    // Add these new fields for admin dashboard:
    private String customerName; // Customer name for delivery/pickup orders
    private String customerPhone; // Customer contact
    @Column(name = "customer_email", length = 255)
    private String customerEmail; // Optional: for order confirmation email
    private String orderType; // "DINE_IN", "DELIVERY", "PICKUP"
    private LocalDateTime orderTime = LocalDateTime.now();
    private Double totalAmount; // Calculated total

    private String status; // "PENDING", "PREPARING", "READY", "COMPLETED", "CANCELLED"

    @Column(length = 500)
    private String notes;

    /** Optional tip amount (e.g. 2.50). */
    private Double tipAmount;

    /** When order was paid (Stripe or manual). */
    @Column(name = "paid_at")
    private java.time.LocalDateTime paidAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL) // Changed to mappedBy
    @JsonManagedReference
    private List<OrderItem> items;

    // Add delivery address for delivery orders
    private String deliveryAddress;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;
    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;
    @Column(name = "created_by", length = 100)
    private String createdBy;

    @PrePersist
    public void onPersist() {
        if (createdAt == null) createdAt = java.time.LocalDateTime.now();
        updatedAt = createdAt;
        syncItemsAndTotal();
    }
    @PreUpdate
    public void onUpdate() {
        updatedAt = java.time.LocalDateTime.now();
        syncItemsAndTotal();
    }
    /** Shared: set order back-reference on items and recalc total. */
    private void syncItemsAndTotal() {
        if (items != null) {
            for (OrderItem item : items) {
                item.setOrder(this);
            }
        }
        calculateTotalAmount();
    }

    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }
    public java.time.LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(java.time.LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public RestaurantOrder() {
    }

    // Updated constructor
    public RestaurantOrder(String customerName, String customerPhone, String orderType,
            Long tableId, String status, List<OrderItem> items, String deliveryAddress) {
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.orderType = orderType;
        this.tableId = tableId;
        this.status = status;
        this.items = items;
        this.deliveryAddress = deliveryAddress;
        this.orderTime = LocalDateTime.now();
        calculateTotalAmount();
    }

    // FIXED: Use getPriceAtOrder() instead of getPrice()
    public void calculateTotalAmount() {
        if (items != null) {
            this.totalAmount = items.stream()
                    .mapToDouble(item -> item.getPriceAtOrder() * item.getQuantity())
                    .sum();
        } else {
            this.totalAmount = 0.0;
        }
    }


    // Getters & Setters for new fields
    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getOrderType() {
        return orderType;
    }

    public void setOrderType(String orderType) {
        this.orderType = orderType;
    }

    public LocalDateTime getOrderTime() {
        return orderTime;
    }

    public void setOrderTime(LocalDateTime orderTime) {
        this.orderTime = orderTime;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    // Existing getters/setters...
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTableId() {
        return tableId;
    }

    public void setTableId(Long tableId) {
        this.tableId = tableId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
        syncItemsAndTotal();
    }
    
    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Double getTipAmount() { return tipAmount; }
    public void setTipAmount(Double tipAmount) { this.tipAmount = tipAmount; }
    public java.time.LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(java.time.LocalDateTime paidAt) { this.paidAt = paidAt; }

    public Long getRestaurantId() { return restaurantId; }
    public void setRestaurantId(Long restaurantId) { this.restaurantId = restaurantId; }
}