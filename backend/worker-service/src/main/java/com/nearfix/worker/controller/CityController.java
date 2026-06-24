package com.nearfix.worker.controller;

import com.nearfix.worker.entity.City;
import com.nearfix.worker.repository.CityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workers/cities")
public class CityController {

    @Autowired
    private CityRepository cityRepository;

    @GetMapping
    public ResponseEntity<List<City>> getCities() {
        return ResponseEntity.ok(cityRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createCity(@RequestBody CityRequest request) {
        if (request.name() == null || request.name().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("City name cannot be empty");
        }
        String cityName = request.name().trim();
        if (cityRepository.existsByNameIgnoreCase(cityName)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("City already exists");
        }
        City city = new City();
        city.setName(cityName);
        City saved = cityRepository.save(city);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCity(@PathVariable Long id) {
        if (!cityRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        cityRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    public static record CityRequest(String name) {}
}
