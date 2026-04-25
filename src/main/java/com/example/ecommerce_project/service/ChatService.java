package com.example.ecommerce_project.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import lombok.Value;

import java.util.Map;
import java.util.List;

@Service
public class ChatService {
    @Value("${gemini.api.key}")
    private String API_KEY;
    private final String URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + API_KEY;    public String askAi(String message) {
        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> request = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(
                    Map.of("text", message)
                ))
            )
        );

        try {
            Map<String, Object> response = restTemplate.postForObject(URL, request, Map.class);
            List candidates = (List) response.get("candidates");
            Map firstCandidate = (Map) candidates.get(0);
            Map content = (Map) firstCandidate.get("content");
            List parts = (List) content.get("parts");
            Map firstPart = (Map) parts.get(0);
            
            return firstPart.get("text").toString();
        } catch (Exception e) {
            return "Hata oluştu: " + e.getMessage();
        }
    }
}