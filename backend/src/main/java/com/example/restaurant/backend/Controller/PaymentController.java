package com.example.restaurant.backend.Controller;

    
import com.example.restaurant.backend.Entity.Payment;
import com.example.restaurant.backend.Repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    // CREATE PAYMENT
    @PostMapping
    public Payment createPayment(@RequestBody Payment payment) {
        return paymentRepository.save(payment);
    }

    // GET ALL PAYMENTS
    @GetMapping
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    // GET PAYMENT BY ID
    @GetMapping("/{id}")
    public Payment getPaymentById(@PathVariable Long id) {
        return paymentRepository.findById(id).orElse(null);
    }

    // UPDATE PAYMENT STATUS
    @PutMapping("/{id}/complete")
    public Payment completePayment(@PathVariable Long id) {
        Payment payment = paymentRepository.findById(id).orElse(null);
        if (payment != null) {
            payment.setStatus("Completed");
            paymentRepository.save(payment);
        }
        return payment;
    }
}
