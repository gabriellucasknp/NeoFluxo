package com.neoenergia.cesar.neofluxo.service;

import com.neoenergia.cesar.neofluxo.entity.PasswordResetToken;
import com.neoenergia.cesar.neofluxo.entity.User;
import com.neoenergia.cesar.neofluxo.repository.PasswordResetTokenRepository;
import com.neoenergia.cesar.neofluxo.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Recuperação de senha por e-mail (US-02).
 *
 * - O token tem 256 bits aleatórios; no banco fica só o SHA-256 dele.
 * - Vale 60 minutos e é de uso único. Pedir um novo apaga os anteriores ainda não usados.
 * - O pedido responde igual exista ou não o e-mail (não revela quem tem conta).
 */
@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);

    /** Mesma política do cadastro (RegisterRequest): mínimo de 6 caracteres. */
    public static final int SENHA_MINIMA = 6;
    public static final int VALIDADE_MINUTOS = 60;

    static final String MSG_INVALIDO = "Link de redefinição inválido. Solicite um novo em \"Esqueci minha senha\".";
    static final String MSG_USADO = "Este link já foi utilizado. Solicite um novo em \"Esqueci minha senha\".";
    static final String MSG_EXPIRADO = "Este link expirou (vale 60 minutos). Solicite um novo em \"Esqueci minha senha\".";
    static final String MSG_POLITICA = "A senha deve ter no mínimo 6 caracteres";

    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository users;
    private final PasswordResetTokenRepository tokens;
    private final PasswordEncoder encoder;
    private final EmailService email;
    private final String frontendUrl;

    public PasswordResetService(UserRepository users,
                                PasswordResetTokenRepository tokens,
                                PasswordEncoder encoder,
                                EmailService email,
                                @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl) {
        this.users = users;
        this.tokens = tokens;
        this.encoder = encoder;
        this.email = email;
        this.frontendUrl = frontendUrl.replaceAll("/+$", "");
    }

    /** Gera o token e manda o e-mail (em outra thread). E-mail desconhecido ou conta inativa: não faz nada. */
    @Transactional
    public void solicitar(String emailInformado) {
        String e = emailInformado == null ? "" : emailInformado.trim();
        User u = users.findByEmailIgnoreCase(e).orElse(null);
        if (u == null || !u.isActive()) {
            log.info("Pedido de redefinição para e-mail sem conta ativa: {}", EmailService.mascarar(e));
            return;
        }
        String token = emitirToken(u);
        email.enviarRedefinicaoSenha(u.getEmail(), u.getName(), linkPara(token), VALIDADE_MINUTOS);
    }

    /** Cria o token novo (apagando os não usados) e devolve o valor em claro, que só vai no link. */
    @Transactional
    String emitirToken(User u) {
        tokens.deleteUnusedByUserId(u.getId());
        String token = novoToken();
        PasswordResetToken t = new PasswordResetToken();
        t.setUser(u);
        t.setTokenHash(sha256(token));
        t.setExpiresAt(Instant.now().plus(Duration.ofMinutes(VALIDADE_MINUTOS)));
        tokens.save(t);
        return token;
    }

    @Transactional
    public void redefinir(String token, String novaSenha) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException(MSG_INVALIDO);
        }
        if (novaSenha == null || novaSenha.length() < SENHA_MINIMA) {
            throw new IllegalArgumentException(MSG_POLITICA);
        }
        PasswordResetToken t = tokens.findByTokenHash(sha256(token.trim()))
                .orElseThrow(() -> new IllegalArgumentException(MSG_INVALIDO));
        if (t.isUsed()) {
            throw new IllegalArgumentException(MSG_USADO);
        }
        Instant agora = Instant.now();
        if (t.isExpired(agora)) {
            throw new IllegalArgumentException(MSG_EXPIRADO);
        }
        User u = t.getUser();
        if (!u.isActive()) {
            throw new IllegalArgumentException("Conta de usuário inativa. Contate o administrador do sistema.");
        }
        u.setPasswordHash(encoder.encode(novaSenha));
        users.save(u);
        t.setUsedAt(agora);
        tokens.save(t);
        log.info("Senha redefinida por link de e-mail para {}", EmailService.mascarar(u.getEmail()));
    }

    String linkPara(String token) {
        return frontendUrl + "/redefinir-senha?token=" + token;
    }

    private static String novoToken() {
        byte[] b = new byte[32];
        RANDOM.nextBytes(b);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(b);
    }

    static String sha256(String valor) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(valor.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 indisponível", e);
        }
    }
}
