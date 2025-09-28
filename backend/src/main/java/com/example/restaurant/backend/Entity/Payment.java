package com.example.restaurant.backend.Entity;

import jakarta.persistence.*;

@Entity
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId; // Links to RestaurantOrder
    private String method; // e.g. "Cash", "Card", "Online"
    private double amount;
    private String status; // e.g. "Pending", "Completed"

    public Payment() {
    }

    public Payment(Long orderId, String method, double amount, String status) {
        this.orderId = orderId;
        this.method = method;
        this.amount = amount;
        this.status = status;
    }

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}