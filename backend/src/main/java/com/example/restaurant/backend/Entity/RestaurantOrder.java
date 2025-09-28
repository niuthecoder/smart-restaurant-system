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

    private Long tableId;

    // Add these new fields for admin dashboard:
    private String customerName; // Customer name for delivery/pickup orders
    private String customerPhone; // Customer contact
    private String orderType; // "DINE_IN", "DELIVERY", "PICKUP"
    private LocalDateTime orderTime = LocalDateTime.now();
    private Double totalAmount; // Calculated total

    private String status; // "PENDING", "PREPARING", "READY", "COMPLETED", "CANCELLED"

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL) // Changed to mappedBy
    @JsonManagedReference
    private List<OrderItem> items;

    // Add delivery address for delivery orders
    private String deliveryAddress;

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

    // Also fix the @OneToMany mapping to use mappedBy
    @PrePersist
    @PreUpdate
    public void setOrderReference() {
        if (items != null) {
            for (OrderItem item : items) {
                item.setOrder(this);
            }
        }
        calculateTotalAmount();
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
        setOrderReference(); // Set the back-reference
    }
}