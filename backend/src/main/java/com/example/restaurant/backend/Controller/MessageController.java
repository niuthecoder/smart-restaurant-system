package com.example.restaurant.backend.Controller;

import com.example.restaurant.backend.Entity.Message;
import com.example.restaurant.backend.Repository.MessageRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class MessageController {

    private final MessageRepository repo;

    public MessageController(MessageRepository repo) {
        this.repo = repo;
    }

    // Public: customer sends message
    @PostMapping("/messages")
public ResponseEntity<?> create(@RequestBody JsonNode body) {
  try {
    JsonNode node = body;

    // If frontend sends an array, take the first item
    if (node.isArray()) {
      if (node.size() == 0) return ResponseEntity.badRequest().body("Empty array");
      node = node.get(0);
    }

    ObjectMapper mapper = new ObjectMapper();
    Message message = mapper.treeToValue(node, Message.class);

    if (message.getName() == null || message.getName().trim().isEmpty())
      return ResponseEntity.badRequest().body("Name is required");
    if (message.getEmail() == null || message.getEmail().trim().isEmpty())
      return ResponseEntity.badRequest().body("Email is required");
    if (message.getContent() == null || message.getContent().trim().isEmpty())
      return ResponseEntity.badRequest().body("Content is required");

    return ResponseEntity.ok(repo.save(message));
  } catch (Exception e) {
    return ResponseEntity.badRequest().body("Invalid JSON");
  }
}
    // Admin: view all messages
    
    @GetMapping("/admin/messages")
    public List<Message> all() {
        return repo.findAll();
    }
}
