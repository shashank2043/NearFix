package com.nearfix.worker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nearfix.worker.entity.City;
import com.nearfix.worker.repository.CityRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class CityControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CityRepository cityRepository;

    @InjectMocks
    private CityController cityController;

    private ObjectMapper objectMapper;
    private City sampleCity;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(cityController).build();
        objectMapper = new ObjectMapper();
        
        sampleCity = new City();
        sampleCity.setId(1L);
        sampleCity.setName("Bangalore");
    }

    @Test
    void getCities_ShouldReturnList() throws Exception {
        when(cityRepository.findAll()).thenReturn(Arrays.asList(sampleCity));

        mockMvc.perform(get("/api/workers/cities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].name").value("Bangalore"));

        verify(cityRepository).findAll();
    }

    @Test
    void createCity_WhenSuccessful_ShouldReturnCreated() throws Exception {
        CityController.CityRequest req = new CityController.CityRequest("Delhi");
        City savedCity = new City();
        savedCity.setId(2L);
        savedCity.setName("Delhi");

        when(cityRepository.existsByNameIgnoreCase("Delhi")).thenReturn(false);
        when(cityRepository.save(any())).thenReturn(savedCity);

        mockMvc.perform(post("/api/workers/cities")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(2L))
                .andExpect(jsonPath("$.name").value("Delhi"));

        verify(cityRepository).save(any(City.class));
    }

    @Test
    void createCity_WhenEmptyName_ShouldReturnBadRequest() throws Exception {
        CityController.CityRequest req = new CityController.CityRequest("");

        mockMvc.perform(post("/api/workers/cities")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("City name cannot be empty"));

        verify(cityRepository, never()).save(any());
    }

    @Test
    void createCity_WhenCityExists_ShouldReturnConflict() throws Exception {
        CityController.CityRequest req = new CityController.CityRequest("Bangalore");
        when(cityRepository.existsByNameIgnoreCase("Bangalore")).thenReturn(true);

        mockMvc.perform(post("/api/workers/cities")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(content().string("City already exists"));

        verify(cityRepository, never()).save(any());
    }

    @Test
    void deleteCity_WhenExists_ShouldReturnNoContent() throws Exception {
        when(cityRepository.existsById(1L)).thenReturn(true);

        mockMvc.perform(delete("/api/workers/cities/1"))
                .andExpect(status().isNoContent());

        verify(cityRepository).deleteById(1L);
    }

    @Test
    void deleteCity_WhenNotFound_ShouldReturnNotFound() throws Exception {
        when(cityRepository.existsById(1L)).thenReturn(false);

        mockMvc.perform(delete("/api/workers/cities/1"))
                .andExpect(status().isNotFound());

        verify(cityRepository, never()).deleteById(any());
    }
}
