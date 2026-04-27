package com.example.ecommerce_project.service;

import java.util.List;
import java.math.BigDecimal;

import org.springframework.stereotype.Service;

import com.example.ecommerce_project.entity.Product;
import com.example.ecommerce_project.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    
    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getFilteredProducts(Boolean bestseller, String category, Double priceGte, Double priceLte, String q, String sort, String order, Integer storeId) {
        List<Product> products = productRepository.findAll();

        if (storeId != null) {
            products = products.stream().filter(p -> p.getStoreId() != null && p.getStoreId().equals(storeId)).toList();
        }

        if (bestseller != null && bestseller) {
            products = products.stream().limit(3).toList();
        }

        if (category != null && !category.isEmpty() && !category.equals("All")) {
            // Get category ID from name
            List<String> allCats = getAllCategories();
            int catId = allCats.indexOf(category) + 1; // Simplistic mapping
            products = products.stream()
                .filter(p -> p.getCategoryId() != null && p.getCategoryId() == catId)
                .toList();
        }

        if (priceGte != null) {
            BigDecimal gte = BigDecimal.valueOf(priceGte);
            products = products.stream().filter(p -> p.getPrice() != null && p.getPrice().compareTo(gte) >= 0).toList();
        }
        if (priceLte != null) {
            BigDecimal lte = BigDecimal.valueOf(priceLte);
            products = products.stream().filter(p -> p.getPrice() != null && p.getPrice().compareTo(lte) <= 0).toList();
        }
        if (q != null && !q.isEmpty()) {
            String lowerQ = q.toLowerCase();
            products = products.stream()
                .filter(p -> p.getName().toLowerCase().contains(lowerQ))
                .toList();
        }

        if (sort != null) {
            products = new java.util.ArrayList<>(products);
            products.sort((p1, p2) -> {
                int cmp = 0;
                if ("price".equals(sort)) {
                    if (p1.getPrice() == null) return 1;
                    if (p2.getPrice() == null) return -1;
                    cmp = p1.getPrice().compareTo(p2.getPrice());
                }
                else if ("name".equals(sort)) cmp = p1.getName().compareToIgnoreCase(p2.getName());
                return "desc".equals(order) ? -cmp : cmp;
            });
        }

        return products;
    }
    
    public List<String> getAllCategories() {
        return productRepository.findDistinctCategories();
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProductPrice(Integer id, BigDecimal newPrice) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setPrice(newPrice);
        return productRepository.save(product);
    }

    public void deleteProduct(Integer id) {
        productRepository.deleteById(id);
    }
}