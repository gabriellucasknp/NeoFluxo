package com.neoenergia.cesar.neofluxo.service;

import com.neoenergia.cesar.neofluxo.dto.LoginRequest;
import com.neoenergia.cesar.neofluxo.entity.PasswordResetToken;
import com.neoenergia.cesar.neofluxo.entity.User;
import com.neoenergia.cesar.neofluxo.repository.PasswordResetTokenRepository;
import com.neoenergia.cesar.neofluxo.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class PasswordResetServiceTest {

    @Autowired private PasswordResetService service;
    @Autowired private AuthService authService;
    @Autowired private UserRepository users;
    @Autowired private PasswordResetTokenRepository tokens;

    private User carlos;

    @BeforeEach
    void setUp() {
        carlos = users.findByEmailIgnoreCase("carlos.mendes@neoenergia.com").orElseThrow();
    }

    @Test
    @DisplayName("US-02: token válido redefine a senha e o login passa a aceitar só a nova")
    void redefineComTokenValido() {
        String token = service.emitirToken(carlos);

        PasswordResetToken salvo = tokens.findByTokenHash(PasswordResetService.sha256(token)).orElseThrow();
        assertNotEquals(token, salvo.getTokenHash(), "o banco guarda só o hash");
        assertTrue(salvo.getExpiresAt().isAfter(Instant.now().plusSeconds(59 * 60)));

        service.redefinir(token, "novaSenha1");

        assertNotNull(authService.login(new LoginRequest("carlos.mendes@neoenergia.com", "novaSenha1")).token());
        assertThrows(BadCredentialsException.class,
                () -> authService.login(new LoginRequest("carlos.mendes@neoenergia.com", "demo123")));
    }

    @Test
    @DisplayName("US-02: o mesmo link não funciona duas vezes")
    void tokenEhDeUsoUnico() {
        String token = service.emitirToken(carlos);
        service.redefinir(token, "novaSenha1");

        IllegalArgumentException e = assertThrows(IllegalArgumentException.class,
                () -> service.redefinir(token, "outraSenha2"));
        assertEquals(PasswordResetService.MSG_USADO, e.getMessage());
    }

    @Test
    @DisplayName("US-02: link com mais de 60 minutos é recusado")
    void tokenExpirado() {
        String token = service.emitirToken(carlos);
        PasswordResetToken t = tokens.findByTokenHash(PasswordResetService.sha256(token)).orElseThrow();
        t.setExpiresAt(Instant.now().minusSeconds(1));
        tokens.saveAndFlush(t);

        IllegalArgumentException e = assertThrows(IllegalArgumentException.class,
                () -> service.redefinir(token, "novaSenha1"));
        assertEquals(PasswordResetService.MSG_EXPIRADO, e.getMessage());
    }

    @Test
    @DisplayName("US-02: token desconhecido é recusado")
    void tokenInvalido() {
        IllegalArgumentException e = assertThrows(IllegalArgumentException.class,
                () -> service.redefinir("token-que-nao-existe", "novaSenha1"));
        assertEquals(PasswordResetService.MSG_INVALIDO, e.getMessage());
    }

    @Test
    @DisplayName("US-02: senha fora da política (mínimo 6) é recusada e o token continua valendo")
    void senhaForaDaPolitica() {
        String token = service.emitirToken(carlos);

        IllegalArgumentException e = assertThrows(IllegalArgumentException.class,
                () -> service.redefinir(token, "123"));
        assertEquals(PasswordResetService.MSG_POLITICA, e.getMessage());

        service.redefinir(token, "novaSenha1");
    }

    @Test
    @DisplayName("US-02: pedir um link novo invalida o anterior")
    void novoTokenInvalidaAnterior() {
        String antigo = service.emitirToken(carlos);
        String novo = service.emitirToken(carlos);

        IllegalArgumentException e = assertThrows(IllegalArgumentException.class,
                () -> service.redefinir(antigo, "novaSenha1"));
        assertEquals(PasswordResetService.MSG_INVALIDO, e.getMessage());

        service.redefinir(novo, "novaSenha1");
    }

    @Test
    @DisplayName("US-02: e-mail sem conta não gera token nem erro (não revela quem tem conta)")
    void emailDesconhecidoNaoFalha() {
        long antes = tokens.count();
        assertDoesNotThrow(() -> service.solicitar("ninguem@neoenergia.com"));
        assertEquals(antes, tokens.count());

        service.solicitar("carlos.mendes@neoenergia.com");
        assertEquals(antes + 1, tokens.count());
    }
}
