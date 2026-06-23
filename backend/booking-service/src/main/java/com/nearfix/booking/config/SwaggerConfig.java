package com.nearfix.booking.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {
    @Value("${server.port}")
    private String port;

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .servers(List.of(
                        new Server().url("http://localhost:" + port).description("Direct Service"),
                        new Server().url("http://localhost:8080").description("Api Gateway"),
                        new Server().url("/").description("Current Service")
                ))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(
                        new Components()
                                .addSecuritySchemes(
                                        securitySchemeName,
                                        new SecurityScheme()
                                                .name(securitySchemeName)
                                                .type(SecurityScheme.Type.HTTP)      // HTTP type
                                                .scheme("bearer")                    // bearer scheme
                                                .bearerFormat("JWT")                 // JWT format
                                )
                );
    }
}
