package com.example.restaurant.backend.Controller;

import com.example.restaurant.backend.DTO.AvailableTableDTO;
import com.example.restaurant.backend.Service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api")
public class AvailabilityController {

    @Autowired
    private ReservationService reservationService;

    /**
     * Get tables available for the given date and time (90-minute slot).
     * Better UX: returns list of available tables with salon info so frontend can show options directly.
     * Query: date=YYYY-MM-DD&time=HH:mm (24h, e.g. 19:00)
     */
    @GetMapping("/availability")
    public List<AvailableTableDTO> getAvailability(
            @RequestParam String date,
            @RequestParam String time) {
        LocalDate d = LocalDate.parse(date);
        LocalTime t = LocalTime.parse(time);
        return reservationService.getAvailableTables(d, t);
    }
}
