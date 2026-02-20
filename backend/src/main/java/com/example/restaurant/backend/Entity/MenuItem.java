package com.example.restaurant.backend.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Tenant: which restaurant this item belongs to */
    @Column(name = "restaurant_id")
    private Long restaurantId;

    private String name; // e.g. "Margherita Pizza"
    private Double price; // e.g. 12.99
    private String category; // e.g. "Pizza", "Drink"
    private boolean available = true;

    /** Comma-separated tags: Vegetarian, Gluten-free, Spicy, Vegan, etc. */
    @Column(length = 255)
    private String tags;

    /** Image URL or path (e.g. /images/menu/joojeh-kebab.jpg or full URL). Null = use category emoji. */
    @Column(length = 500)
    private String image;

    /** Short description of the dish (e.g. served hot, cold, ingredients). */
    @Column(length = 500)
    private String description;

    public MenuItem() {
    }

    public MenuItem(String name, Double price, String category, boolean available) {
        this.name = name;
        this.price = price;
        this.category = category;
        this.available = available;
    }

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public Long getRestaurantId() { return restaurantId; }
    public void setRestaurantId(Long restaurantId) { this.restaurantId = restaurantId; }
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}