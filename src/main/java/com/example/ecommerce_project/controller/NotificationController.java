package com.example.ecommerce_project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:4200")
public class NotificationController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/send")
    public void sendNotification(@RequestBody Map<String, String> payload) {
        // Broadcast to all subscribers of /topic/updates
        messagingTemplate.convertAndSend("/topic/updates", payload);
    }
}
