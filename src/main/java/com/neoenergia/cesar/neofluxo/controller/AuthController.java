package com.neoenergia.cesar.neofluxo.controller;

import com.neoenergia.cesar.neofluxo.dto.LoginRequest;
import com.neoenergia.cesar.neofluxo.dto.LoginResponse;
import com.neoenergia.cesar.neofluxo.dto.RegisterRequest;
import com.neoenergia.cesar.neofluxo.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest r) {
        return service.login(r);
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public LoginResponse register(@Valid @RequestBody RegisterRequest r) {
        return service.register(r);
    }

    @GetMapping("/me")
    public LoginResponse.UserView me(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalArgumentException("Usuário não autenticado");
        }
        return service.me(UUID.fromString(authentication.getName()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of("message", "Se o e-mail estiver cadastrado, o link de recuperação foi enviado"));
    }
}
