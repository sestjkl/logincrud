package com.teladelogin.logincrud.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Desativa o CSRF para permitir requisições AJAX/Fetch (POST, PUT, DELETE)
                .authorizeHttpRequests(auth -> auth
                        // Libera arquivos estáticos e páginas principais
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/Main.html",
                                "/main.html",
                                "/script.js",
                                "/style.css",
                                "/js/**",
                                "/css/**",
                                "/images/**",
                                "/*.svg",
                                "/*.ico"
                        ).permitAll()
                        // Libera explicitamente todas as operações REST na API de usuários (GET, POST, PUT, DELETE)
                        .requestMatchers(HttpMethod.GET, "/usuarios/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/usuarios/**").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/usuarios/**").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/usuarios/**").permitAll()
                        .anyRequest().authenticated()
                )
                // Ativa o suporte ao OAuth2 Client (Login com o Google)
                .oauth2Login(oauth2 -> oauth2
                        .defaultSuccessUrl("/Main.html", true)
                )
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable());

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}