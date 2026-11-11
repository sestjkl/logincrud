package com.teladelogin.logincrud.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Desativa CSRF para requisições AJAX/Fetch
                .authorizeHttpRequests(auth -> auth
                        // Libera arquivos estáticos e páginas principais
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/Main.html",
                                "/main.html",
                                "/script.js",
                                "/user.js",
                                "/style.css",
                                "/js/**",
                                "/css/**",
                                "/images/**",
                                "/*.svg",
                                "/*.ico"
                        ).permitAll()
                        // Libera explicitamente as rotas de API
                        .requestMatchers(HttpMethod.GET, "/usuarios/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/usuarios/**").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/usuarios/**").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/usuarios/**").permitAll()
                        .anyRequest().authenticated()
                )
                // Impede que o Spring redirecione para uma página de login em HTML se algo falhar
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                )
                // Configuração limpa do OAuth2 apenas para o endpoint do Google
                .oauth2Login(oauth2 -> oauth2
                        .loginPage("/index.html")
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