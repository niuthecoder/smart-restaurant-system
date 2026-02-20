package com.example.restaurant.backend.Controller;

import com.example.restaurant.backend.Repository.RestaurantTableRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/qr")
public class QrController {

    private final RestaurantTableRepository tableRepository;

    @Value("${app.base-url:http://localhost:5173}")
    private String baseUrl;

    public QrController(RestaurantTableRepository tableRepository) {
        this.tableRepository = tableRepository;
    }

    /**
     * Get the order URL for a table (for QR code generation).
     * Frontend can use this URL or generate QR from it.
     * Query: tableId= (id) or tableNumber= (table number).
     */
    @GetMapping("/table/{idOrNumber}")
    public ResponseEntity<Map<String, String>> getTableOrderUrl(@PathVariable String idOrNumber) {
        try {
            Long id = Long.parseLong(idOrNumber);
            var byId = tableRepository.findById(id);
            if (byId.isPresent()) {
                int num = byId.get().getNumber();
                String url = baseUrl + "/#order?table=" + num;
                return ResponseEntity.ok(Map.of("url", url, "tableNumber", String.valueOf(num)));
            }
        } catch (NumberFormatException ignored) {}
        int num = -1;
        try {
            num = Integer.parseInt(idOrNumber);
        } catch (NumberFormatException ignored) {
            return ResponseEntity.notFound().build();
        }
        final int tableNum = num;
        return tableRepository.findAll().stream()
                .filter(t -> t.getNumber() == tableNum)
                .findFirst()
                .map(t -> {
                    String url = baseUrl + "/#order?table=" + t.getNumber();
                    return ResponseEntity.<Map<String, String>>ok(Map.of("url", url, "tableNumber", String.valueOf(t.getNumber())));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
