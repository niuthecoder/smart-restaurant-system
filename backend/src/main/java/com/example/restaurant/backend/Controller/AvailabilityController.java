package com.example.restaurant.backend.Controller;

import com.example.restaurant.backend.DTO.AvailableTableDTO;
import com.example.restaurant.backend.Service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Tag(name = "Reservations")
@RestController
@RequestMapping("/api")
public class AvailabilityController {

    @Autowired
    private ReservationService reservationService;

    @Operation(summary = "Check table availability", description = "Returns tables available for the 90-minute slot at the given date and time. Query: date=YYYY-MM-DD&time=HH:mm")
    @GetMapping("/availability")
    public List<AvailableTableDTO> getAvailability(
            @RequestParam String date,
            @RequestParam String time) {
        LocalDate d = LocalDate.parse(date);
        LocalTime t = LocalTime.parse(time);
        return reservationService.getAvailableTables(d, t);
    }
}
