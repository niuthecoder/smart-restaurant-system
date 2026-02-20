package com.example.restaurant.backend.DTO;

import jakarta.validation.constraints.Min;

public class CreateOrderItemRequest {
    private Long menuItemId;
    private String menuItemName; // Fallback when ID not found (e.g. mock data mismatch)
    @Min(value = 1, message = "quantity must be at least 1")
    private int quantity;

    public Long getMenuItemId() {
        return menuItemId;
    }

    public void setMenuItemId(Long menuItemId) {
        this.menuItemId = menuItemId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
    public String getMenuItemName() { return menuItemName; }
    public void setMenuItemName(String menuItemName) { this.menuItemName = menuItemName; }
}
