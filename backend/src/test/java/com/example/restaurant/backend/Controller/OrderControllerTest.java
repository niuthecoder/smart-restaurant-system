package com.example.restaurant.backend.Controller;

import com.example.restaurant.backend.DTO.CreateOrderRequest;
import com.example.restaurant.backend.DTO.CreateOrderItemRequest;
import com.example.restaurant.backend.Entity.MenuItem;
import com.example.restaurant.backend.Repository.MenuItemRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * E2E-style test: place order flow (POST /orders with valid body).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Test
    void placeOrderReturnsOkAndOrderWithId() throws Exception {
        MenuItem first = menuItemRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("Seed data should provide at least one menu item"));
        Long menuItemId = first.getId();

        CreateOrderItemRequest item = new CreateOrderItemRequest();
        item.setMenuItemId(menuItemId);
        item.setQuantity(2);

        CreateOrderRequest req = new CreateOrderRequest();
        req.setCustomerName("E2E Customer");
        req.setCustomerPhone("+15551234567");
        req.setCustomerEmail("e2e@example.com");
        req.setOrderType("DINE_IN");
        req.setItems(List.of(item));

        mockMvc.perform(post("/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.customerName").value("E2E Customer"))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.items.length()").value(1));
    }
}
