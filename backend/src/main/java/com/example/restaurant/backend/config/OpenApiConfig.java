package com.example.restaurant.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI restaurantOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Saffron House — Restaurant API")
                                .description("REST API for orders, reservations, menu, waitlist, payments (Stripe), and admin. Use Swagger UI to try endpoints.")
                                .version("v1.0.0")
                                .contact(new Contact()
                                .name("API Support")
                                .email("support@saffronhouse.com")));
    }
}