package com.neoenergia.cesar.neofluxo.service;

import com.neoenergia.cesar.neofluxo.dto.LoginRequest;
import com.neoenergia.cesar.neofluxo.dto.LoginResponse;
import com.neoenergia.cesar.neofluxo.dto.RegisterRequest;
import com.neoenergia.cesar.neofluxo.entity.User;
import com.neoenergia.cesar.neofluxo.repository.UserRepository;
import com.neoenergia.cesar.neofluxo.security.JwtService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    public LoginResponse login(LoginRequest r) {
        User u = users.findByEmailIgnoreCase(r.email())
                .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas"));
        if (!u.isActive() || !encoder.matches(r.password(), u.getPasswordHash())) {
            throw new BadCredentialsException("Credenciais inválidas");
        }
        return new LoginResponse(
                jwt.generate(u.getId(), u.getEmail(), u.getRole().name()),
                new LoginResponse.UserView(u.getId(), u.getName(), u.getEmail(), u.getRole().name(), u.getDepartment())
        );
    }

    @Transactional
    public LoginResponse register(RegisterRequest r) {
        if (users.findByEmailIgnoreCase(r.email()).isPresent()) {
            throw new IllegalArgumentException("Já existe usuário cadastrado com este e-mail");
        }

        User.Role role = User.Role.PROJETISTA;
        if (r.role() != null) {
            try {
                role = User.Role.valueOf(r.role().toUpperCase());
            } catch (Exception ignored) {
            }
        }

        User u = new User();
        u.setName(r.name().trim());
        u.setEmail(r.email().trim().toLowerCase());
        u.setPasswordHash(encoder.encode(r.password()));
        u.setRole(role);
        u.setDepartment(r.department() != null ? r.department().trim() : "Projetos Elétricos");
        u.setActive(true);

        User saved = users.save(u);

        return new LoginResponse(
                jwt.generate(saved.getId(), saved.getEmail(), saved.getRole().name()),
                new LoginResponse.UserView(saved.getId(), saved.getName(), saved.getEmail(), saved.getRole().name(), saved.getDepartment())
        );
    }

    public LoginResponse.UserView me(UUID userId) {
        User u = users.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));
        return new LoginResponse.UserView(u.getId(), u.getName(), u.getEmail(), u.getRole().name(), u.getDepartment());
    }
}
