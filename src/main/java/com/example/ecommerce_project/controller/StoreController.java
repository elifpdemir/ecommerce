package com.example.ecommerce_project.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ecommerce_project.entity.Store;
import com.example.ecommerce_project.service.StoreService;

@RestController
@RequestMapping("/api/stores")
@CrossOrigin(origins = "http://localhost:4200")
public class StoreController {

    private final StoreService storeService;

    public StoreController(StoreService storeService) {
        this.storeService = storeService;
    }

    @GetMapping
    public List<Store> getAllStores() {
        return storeService.getAllStores();
    }

    @org.springframework.web.bind.annotation.PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('ADMIN')")
    public Store createStore(@org.springframework.web.bind.annotation.RequestBody Store store) {
        return storeService.createStore(store);
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('ADMIN')")
    public org.springframework.http.ResponseEntity<Void> deleteStore(@org.springframework.web.bind.annotation.PathVariable Integer id) {
        storeService.deleteStore(id);
        return org.springframework.http.ResponseEntity.noContent().build();
    }

    @org.springframework.beans.factory.annotation.Autowired
    private com.example.ecommerce_project.repository.UserRepository userRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private com.example.ecommerce_project.repository.StoreRepository storeRepository;

    @GetMapping("/my")
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('CORPORATE')")
    public org.springframework.http.ResponseEntity<Store> getMyStore(java.security.Principal principal) {
        if (principal == null) return org.springframework.http.ResponseEntity.status(401).build();
        com.example.ecommerce_project.entity.User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null) return org.springframework.http.ResponseEntity.status(401).build();

        return storeRepository.findByOwnerId(user.getId())
            .map(org.springframework.http.ResponseEntity::ok)
            .orElse(org.springframework.http.ResponseEntity.notFound().build());
    }
}