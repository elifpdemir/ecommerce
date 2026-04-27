package com.example.ecommerce_project.controller;

import com.example.ecommerce_project.service.ChatService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:4200")
public class ChatController {

    private final ChatService chatService;
    private final com.example.ecommerce_project.repository.UserRepository userRepository;

    public ChatController(ChatService chatService, com.example.ecommerce_project.repository.UserRepository userRepository) {
        this.chatService = chatService;
        this.userRepository = userRepository;
    }

    @GetMapping(value = "/ask", produces = "text/plain;charset=UTF-8")
    public String ask(@RequestParam String message, java.security.Principal principal) {
        System.out.println("Chat request received. Principal: " + (principal == null ? "NULL" : principal.getName()));
        if (principal == null || principal.getName().equals("anonymousUser")) {
            return "Lütfen analiz yapmak için giriş yapın. Guest (Misafir) modunda ticari verilere erişemezsiniz.";
        }
        
        String email = principal.getName();
        String role = userRepository.findByEmail(email)
            .map(u -> u.getRoleType().name())
            .orElse("INDIVIDUAL");

        return chatService.askAi(message, email, role);
    }
}
