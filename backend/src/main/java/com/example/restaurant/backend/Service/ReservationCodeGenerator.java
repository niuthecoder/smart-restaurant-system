package com.example.restaurant.backend.Service;

import com.example.restaurant.backend.Repository.ReservationRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

/**
 * Generates unique reservation codes in the form R-YYYYMMDD-XXXX (e.g. R-20260214-8F3K).
 */
@Component
public class ReservationCodeGenerator {

    private static final String ALPHANUMERIC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O, 1/I
    private static final int SUFFIX_LENGTH = 4;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final ReservationRepository reservationRepository;

    public ReservationCodeGenerator(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    public String generate(LocalDateTime reservationTime) {
        String datePart = reservationTime.format(DATE_FORMAT);
        String prefix = "R-" + datePart + "-";
        for (int attempt = 0; attempt < 20; attempt++) {
            String suffix = randomSuffix();
            String code = prefix + suffix;
            if (!reservationRepository.existsByReservationCode(code)) {
                return code;
            }
        }
        throw new IllegalStateException("Could not generate unique reservation code");
    }

    private static final Random RND = new Random();

    private String randomSuffix() {
        StringBuilder sb = new StringBuilder(SUFFIX_LENGTH);
        int len = ALPHANUMERIC.length();
        for (int i = 0; i < SUFFIX_LENGTH; i++) {
            sb.append(ALPHANUMERIC.charAt(RND.nextInt(len)));
        }
        return sb.toString();
    }
}
