package com.example.restaurant.backend.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link to RestaurantOrder - fixed JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    @JsonBackReference
    private RestaurantOrder order;

    // Link to MenuItem
    @ManyToOne
    @JoinColumn(name = "menu_item_id")
    private MenuItem menuItem;

    private int quantity;
    private double priceAtOrder = 0.0;

    public OrderItem() {
    }

    public OrderItem(MenuItem menuItem, int quantity, double priceAtOrder) {
        this.menuItem = menuItem;
        this.quantity = quantity;
        this.priceAtOrder = priceAtOrder;
    }

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public RestaurantOrder getOrder() {
        return order;
    }

    public void setOrder(RestaurantOrder order) {
        this.order = order;
    }

    public MenuItem getMenuItem() {
        return menuItem;
    }

    public void setMenuItem(MenuItem menuItem) {
        this.menuItem = menuItem;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public double getPriceAtOrder() {
        return priceAtOrder;
    }

    public void setPriceAtOrder(double priceAtOrder) {
        this.priceAtOrder = priceAtOrder;
    }

    // Helper method to get item name from MenuItem
    public String getItemName() {
        return menuItem != null ? menuItem.getName() : "Unknown Item";
    }

    // Helper method to calculate subtotal
    public double getSubtotal() {
        return priceAtOrder * quantity;
    }
}