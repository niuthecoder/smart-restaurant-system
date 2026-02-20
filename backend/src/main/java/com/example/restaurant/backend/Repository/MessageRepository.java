package com.example.restaurant.backend.Repository;

import com.example.restaurant.backend.Entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {
}
