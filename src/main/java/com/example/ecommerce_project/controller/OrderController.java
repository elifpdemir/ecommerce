package com.example.ecommerce_project.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ecommerce_project.entity.Order;
import com.example.ecommerce_project.service.OrderService;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:4200")
public class OrderController {

    private final OrderService orderService;
    private final com.example.ecommerce_project.repository.UserRepository userRepository;

    @GetMapping("/debug/users")
    public List<com.example.ecommerce_project.entity.User> dumpUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/debug/delete-ghosts")
    @org.springframework.transaction.annotation.Transactional
    public String deleteGhosts(@org.springframework.beans.factory.annotation.Autowired com.example.ecommerce_project.repository.OrderRepository orderRepository, @org.springframework.beans.factory.annotation.Autowired com.example.ecommerce_project.repository.OrderItemRepository orderItemRepository) {
        List<Order> orders = orderRepository.findAll().stream().filter(o -> o.getInvoiceNo() != null && (o.getInvoiceNo() == 946182 || o.getInvoiceNo() == 992262)).toList();
        for (Order o : orders) {
            List<com.example.ecommerce_project.entity.OrderItem> items = orderItemRepository.findByOrderId(o.getId());
            orderItemRepository.deleteAll(items);
            orderRepository.delete(o);
        }
        return "Deleted " + orders.size() + " ghost orders.";
    }

    private final com.example.ecommerce_project.repository.StoreRepository storeRepository;

    public OrderController(OrderService orderService, com.example.ecommerce_project.repository.UserRepository userRepository, com.example.ecommerce_project.repository.StoreRepository storeRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
        this.storeRepository = storeRepository;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<Order> getAllOrders(java.security.Principal principal) {
        if (principal == null) return List.of();
        
        com.example.ecommerce_project.entity.User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null) return List.of();

        if (user.getRoleType() == com.example.ecommerce_project.entity.RoleType.ADMIN) {
            return orderService.getAllOrders();
        } else if (user.getRoleType() == com.example.ecommerce_project.entity.RoleType.CORPORATE) {
            return storeRepository.findByOwnerId(user.getId())
                .map(store -> orderService.getOrdersByStoreId(store.getId()))
                .orElse(List.of());
        } else {
            return orderService.getOrdersByUserId(user.getId());
        }
    }

    @org.springframework.web.bind.annotation.PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Order> createOrder(@RequestBody Order order, java.security.Principal principal) {
        if (principal != null) {
            userRepository.findByEmail(principal.getName()).ifPresent(user -> {
                order.setUserId(user.getId());
            });
        }
        Order savedOrder = orderService.createOrder(order);
        return ResponseEntity.status(201).body(savedOrder);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('CORPORATE') or hasAuthority('ADMIN')")
    public ResponseEntity<Order> updateStatus(@PathVariable Integer id, @RequestBody Map<String, String> statusMap) {
        String newStatus = statusMap.get("status");
        Order updatedOrder = orderService.updateOrderStatus(id, newStatus);
        return ResponseEntity.ok(updatedOrder);
}
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Order> getOrderById(@PathVariable Integer id, java.security.Principal principal) {
        Order order = orderService.getAllOrders().stream()
            .filter(o -> o.getId().equals(id))
            .findFirst()
            .orElse(null);

        if (order == null) return ResponseEntity.notFound().build();

        com.example.ecommerce_project.entity.User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null) return ResponseEntity.status(401).build();

        if (user.getRoleType() != com.example.ecommerce_project.entity.RoleType.ADMIN && 
            !order.getUserId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(order);
    }
}