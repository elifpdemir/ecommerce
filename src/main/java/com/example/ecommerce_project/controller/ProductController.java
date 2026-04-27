package com.example.ecommerce_project.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.ecommerce_project.entity.Product;
import com.example.ecommerce_project.service.ProductService;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:4200")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<Product> getProducts(
            @RequestParam(required = false) Boolean bestseller,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double price_gte,
            @RequestParam(required = false) Double price_lte,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String _sort,
            @RequestParam(required = false) String _order,
            @RequestParam(required = false) Integer storeId) {
        return productService.getFilteredProducts(bestseller, category, price_gte, price_lte, q, _sort, _order, storeId);
    }

    @GetMapping("/store/{storeId}")
    public List<Product> getProductsByStore(@org.springframework.web.bind.annotation.PathVariable Integer storeId) {
        return productService.getAllProducts().stream()
            .filter(p -> p.getStoreId() != null && p.getStoreId().equals(storeId))
            .toList();
    }

    @GetMapping("/categories")
public List<String> getCategories() {
    List<String> categories = productService.getAllCategories();
    
    System.out.println("MySQL'den gelen kategori sayısı: " + categories.size());
    
    return categories;
}
@GetMapping("/ping")
@org.springframework.transaction.annotation.Transactional
public org.springframework.http.ResponseEntity<String> ping(@org.springframework.beans.factory.annotation.Autowired com.example.ecommerce_project.repository.OrderRepository orderRepository, @org.springframework.beans.factory.annotation.Autowired com.example.ecommerce_project.repository.OrderItemRepository orderItemRepository, @org.springframework.beans.factory.annotation.Autowired com.example.ecommerce_project.repository.ProductRepository productRepository) {
    long totalOrdersBefore = orderRepository.count();
    long totalProducts = productRepository.count();

    // Delete specifically requested invoice numbers
    java.util.List<com.example.ecommerce_project.entity.Order> ghostOrders = orderRepository.findAll().stream()
        .filter(o -> o.getInvoiceNo() != null && (o.getInvoiceNo() == 946182 || o.getInvoiceNo() == 992262))
        .toList();
    
    // Also delete any orders that have NO items (the "ismi gözükmeyen" ones)
    java.util.List<com.example.ecommerce_project.entity.Order> emptyOrders = orderRepository.findAll().stream()
        .filter(o -> orderItemRepository.findByOrderId(o.getId()).isEmpty())
        .toList();

    java.util.Set<com.example.ecommerce_project.entity.Order> toDelete = new java.util.HashSet<>();
    toDelete.addAll(ghostOrders);
    toDelete.addAll(emptyOrders);

    for (com.example.ecommerce_project.entity.Order o : toDelete) {
        java.util.List<com.example.ecommerce_project.entity.OrderItem> items = orderItemRepository.findByOrderId(o.getId());
        if (!items.isEmpty()) orderItemRepository.deleteAll(items);
        orderRepository.delete(o);
    }

    String html = "<html><body style='font-family:sans-serif; padding: 2rem; line-height: 1.6;'>" +
           "<h1 style='color: #10b981;'>✅ Sistem Durumu: AKTİF</h1>" +
           "<div style='background: #fff; border: 1px solid #ddd; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>" +
           "<h3>📊 Veritabanı Özet Bilgileri:</h3>" +
           "<ul>" +
           "<li><b>Toplam Ürün Sayısı:</b> " + totalProducts + "</li>" +
           "<li><b>İşlem Öncesi Sipariş Sayısı:</b> " + totalOrdersBefore + "</li>" +
           "<li style='color: #ef4444;'><b>Silinen Hatalı Sipariş (Ghost):</b> " + toDelete.size() + "</li>" +
           "<li><b>Kalan Temiz Sipariş Sayısı:</b> " + (totalOrdersBefore - toDelete.size()) + "</li>" +
           "</ul>" +
           "<p style='color: #059669; font-weight: bold;'>Temizlik başarıyla tamamlandı!</p>" +
           "</div>" +
           "<p style='margin-top: 2rem; color: #6b7280;'>Artık Admin panelinde sadece ürünleri olan gerçek siparişler görünecektir.</p>" +
           "</body></html>";

    return org.springframework.http.ResponseEntity.ok()
            .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "text/html; charset=UTF-8")
            .body(html);
}

    @org.springframework.web.bind.annotation.PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('ADMIN') or hasAuthority('CORPORATE')")
    public com.example.ecommerce_project.entity.Product createProduct(@org.springframework.web.bind.annotation.RequestBody com.example.ecommerce_project.entity.Product product) {
        return productService.createProduct(product);
    }

    @org.springframework.web.bind.annotation.PutMapping("/{id}/price")
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('ADMIN') or hasAuthority('CORPORATE')")
    public org.springframework.http.ResponseEntity<com.example.ecommerce_project.entity.Product> updateProductPrice(@org.springframework.web.bind.annotation.PathVariable Integer id, @org.springframework.web.bind.annotation.RequestBody java.util.Map<String, java.math.BigDecimal> priceMap) {
        java.math.BigDecimal newPrice = priceMap.get("price");
        return org.springframework.http.ResponseEntity.ok(productService.updateProductPrice(id, newPrice));
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('ADMIN') or hasAuthority('CORPORATE')")
    public org.springframework.http.ResponseEntity<Void> deleteProduct(@org.springframework.web.bind.annotation.PathVariable Integer id) {
        productService.deleteProduct(id);
        return org.springframework.http.ResponseEntity.noContent().build();
    }
}