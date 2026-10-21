package com.neoenergia.cesar.neofluxo.service;

import com.neoenergia.cesar.neofluxo.dto.LoginRequest;
import com.neoenergia.cesar.neofluxo.dto.LoginResponse;
import com.neoenergia.cesar.neofluxo.dto.RegisterRequest;
import com.neoenergia.cesar.neofluxo.entity.User;
import com.neoenergia.cesar.neofluxo.repository.UserRepository;
import com.neoenergia.cesar.neofluxo.security.JwtService;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final NeoenergiaCorporateAuthService corporateAuth;

    public AuthService(UserRepository users,
                       PasswordEncoder encoder,
                       JwtService jwt,
                       NeoenergiaCorporateAuthService corporateAuth) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
        this.corporateAuth = corporateAuth;
    }

    public LoginResponse login(LoginRequest r) {
        boolean isCorporate = corporateAuth.isCorporateDomain(r.email());
        log.info("Tentativa de login para e-mail corporativo: {} (Domínio corporativo: {})",
                maskEmail(r.email()), isCorporate);

        User u = users.findByEmailIgnoreCase(r.email().trim())
                .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas"));

        if (!u.isActive()) {
            throw new BadCredentialsException("Conta de usuário inativa. Contate o administrador do sistema.");
        }

        if (!encoder.matches(r.password(), u.getPasswordHash())) {
            throw new BadCredentialsException("Credenciais inválidas");
        }

        return new LoginResponse(
                jwt.generate(u.getId(), u.getEmail(), u.getRole().name()),
                new LoginResponse.UserView(u.getId(), u.getName(), u.getEmail(), u.getRole().name(), u.getDepartment())
        );
    }

    @Transactional
    public LoginResponse register(RegisterRequest r) {
        if (users.findByEmailIgnoreCase(r.email().trim()).isPresent()) {
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

    public Map<String, Object> getCorporateProviderInfo() {
        return corporateAuth.getProviderDetails();
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "***";
        int at = email.indexOf('@');
        return email.substring(0, Math.min(3, at)) + "***" + email.substring(at);
    }
}
