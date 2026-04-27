package com.example.ecommerce_project.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.ecommerce_project.entity.Order;
import com.example.ecommerce_project.repository.OrderRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final com.example.ecommerce_project.repository.OrderItemRepository orderItemRepository;
    private final com.example.ecommerce_project.repository.ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository, com.example.ecommerce_project.repository.OrderItemRepository orderItemRepository, com.example.ecommerce_project.repository.ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
    }

    private Order populateProductNames(Order order) {
        java.util.List<String> names = orderItemRepository.findByOrderId(order.getId()).stream()
            .map(item -> productRepository.findById(item.getProductId())
                .map(com.example.ecommerce_project.entity.Product::getName)
                .orElse("Unknown Product"))
            .toList();
        order.setProductNames(names);
        return order;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "id"))
            .stream().map(this::populateProductNames).toList();
    }

    public List<Order> getOrdersByStoreId(Integer storeId) {
        return orderRepository.findByStoreIdOrderByIdDesc(storeId)
            .stream().map(this::populateProductNames).toList();
    }

    public List<Order> getOrdersByUserId(Integer userId) {
        return orderRepository.findByUserIdOrderByIdDesc(userId)
            .stream().map(this::populateProductNames).toList();
    }

    @org.springframework.transaction.annotation.Transactional
    public Order createOrder(Order order) {
        Order savedOrder = orderRepository.save(order);
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            for (com.example.ecommerce_project.entity.OrderItem item : order.getItems()) {
                item.setOrderId(savedOrder.getId());
                orderItemRepository.save(item);
            }
        }
        return savedOrder;
    }

    public Order updateOrderStatus(Integer orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order Not Found: " + orderId));
        order.setStatus(newStatus);
        return orderRepository.save(order);
    }
}
