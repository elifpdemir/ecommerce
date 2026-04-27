package com.example.ecommerce_project.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.ecommerce_project.entity.Store;
import com.example.ecommerce_project.repository.StoreRepository;

@Service
public class StoreService {

    private final StoreRepository storeRepository;

    public StoreService(StoreRepository storeRepository) {
        this.storeRepository = storeRepository;
    }

    public List<Store> getAllStores() {
        return storeRepository.findAll();
    }

    public Store createStore(Store store) {
        return storeRepository.save(store);
    }

    public void deleteStore(Integer id) {
        storeRepository.deleteById(id);
    }
}
