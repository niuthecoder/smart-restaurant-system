package com.example.restaurant.backend.Repository;

import com.example.restaurant.backend.Entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
}