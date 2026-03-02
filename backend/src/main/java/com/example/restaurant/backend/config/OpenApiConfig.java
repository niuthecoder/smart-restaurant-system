package com.example.restaurant.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI restaurantOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Saffron House — Restaurant API")
                        .description("REST API for orders, reservations, menu, waitlist, payments (Stripe), and admin.\n\n"
                                + "**Auth**: Most write endpoints require a JWT Bearer token. "
                                + "Call `POST /api/auth/login` to obtain one, then click **Authorize** above and paste the token.\n\n"
                                + "**Roles**: ADMIN (full access), WAITER (orders + tables), CUSTOMER (public endpoints).")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("API Support")
                                .email("support@saffronhouse.com")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer JWT"))
                .components(new Components()
                        .addSecuritySchemes("Bearer JWT", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Paste the token returned by POST /api/auth/login")));
    }
}