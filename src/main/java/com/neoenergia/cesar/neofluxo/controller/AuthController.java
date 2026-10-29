package com.neoenergia.cesar.neofluxo.controller;

import com.neoenergia.cesar.neofluxo.dto.ForgotPasswordRequest;
import com.neoenergia.cesar.neofluxo.dto.LoginRequest;
import com.neoenergia.cesar.neofluxo.dto.LoginResponse;
import com.neoenergia.cesar.neofluxo.dto.RegisterRequest;
import com.neoenergia.cesar.neofluxo.dto.ResetPasswordRequest;
import com.neoenergia.cesar.neofluxo.service.AuthService;
import com.neoenergia.cesar.neofluxo.service.PasswordResetService;
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
    private final PasswordResetService passwordReset;

    public AuthController(AuthService service, PasswordResetService passwordReset) {
        this.service = service;
        this.passwordReset = passwordReset;
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

    /** US-02: resposta sempre igual, exista ou não o e-mail (não revela quem tem conta). */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest r) {
        passwordReset.solicitar(r.email());
        return ResponseEntity.ok(Map.of("message", "Se o e-mail estiver cadastrado, o link de recuperação foi enviado"));
    }

    /** US-02: troca a senha com o token do link (60 minutos, uso único). */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest r) {
        passwordReset.redefinir(r.token(), r.password());
        return ResponseEntity.ok(Map.of("message", "Senha redefinida com sucesso"));
    }

    @GetMapping("/corporate/status")
    public ResponseEntity<Map<String, Object>> corporateProviderStatus() {
        return ResponseEntity.ok(service.getCorporateProviderInfo());
    }
}
