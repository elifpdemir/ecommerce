package com.example.ecommerce_project.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "orders", indexes = {
    @Index(name = "idx_order_user", columnList = "user_id"),
    @Index(name = "idx_order_store", columnList = "store_id")
})
@Data
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "store_id")
    private Integer storeId;

    private String status="Pending";

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Column(name = "grand_total")
    private BigDecimal grandTotal;

    @Column(name = "invoice_no")
    private Integer invoiceNo;

    @Column(name = "order_date")
    private LocalDate orderDate;

    @jakarta.persistence.PrePersist
    protected void onCreate() {
        if (this.orderDate == null) {
            this.orderDate = LocalDate.now();
        }
        if (this.invoiceNo == null) {
            this.invoiceNo = (int) (Math.random() * 1000000);
        }
    }

    @jakarta.persistence.Transient
    private java.util.List<String> productNames = new java.util.ArrayList<>();

    @jakarta.persistence.Transient
    private java.util.List<OrderItem> items = new java.util.ArrayList<>();
}