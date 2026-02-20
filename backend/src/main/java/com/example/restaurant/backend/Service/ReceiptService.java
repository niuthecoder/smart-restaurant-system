package com.example.restaurant.backend.Service;

import com.example.restaurant.backend.Entity.OrderItem;
import com.example.restaurant.backend.Entity.RestaurantOrder;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class ReceiptService {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public String toHtml(RestaurantOrder order) {
        if (order == null) return "<p>Order not found.</p>";
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>Receipt</title>");
        sb.append("<style>body{font-family:sans-serif;max-width:400px;margin:2rem auto;padding:1rem;} table{width:100%;border-collapse:collapse;} th,td{border-bottom:1px solid #eee;padding:0.5rem 0;} th{text-align:left;} .total{font-weight:bold;font-size:1.1em;}</style>");
        sb.append("</head><body>");
        sb.append("<h1>Receipt</h1>");
        sb.append("<p><strong>Order #").append(order.getId()).append("</strong></p>");
        sb.append("<p>Date: ").append(order.getOrderTime() != null ? order.getOrderTime().format(FMT) : "-").append("</p>");
        if (order.getCustomerName() != null && !order.getCustomerName().isBlank()) {
            sb.append("<p>Customer: ").append(escape(order.getCustomerName())).append("</p>");
        }
        sb.append("<table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead><tbody>");
        if (order.getItems() != null) {
            for (OrderItem i : order.getItems()) {
                sb.append("<tr><td>").append(escape(i.getItemName())).append("</td>")
                        .append("<td>").append(i.getQuantity()).append("</td>")
                        .append("<td>$").append(String.format("%.2f", i.getPriceAtOrder())).append("</td>")
                        .append("<td>$").append(String.format("%.2f", i.getSubtotal())).append("</td></tr>");
            }
        }
        sb.append("</tbody></table>");
        double total = order.getTotalAmount() != null ? order.getTotalAmount() : 0.0;
        sb.append("<p class=\"total\">Total: $").append(String.format("%.2f", total)).append("</p>");
        if (order.getPaidAt() != null) {
            sb.append("<p>Paid on: ").append(order.getPaidAt().format(FMT)).append("</p>");
        }
        sb.append("</body></html>");
        return sb.toString();
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
