package com.neoenergia.cesar.neofluxo.service;

import com.neoenergia.cesar.neofluxo.dto.LoginRequest;
import com.neoenergia.cesar.neofluxo.dto.LoginResponse;
import com.neoenergia.cesar.neofluxo.entity.User;
import com.neoenergia.cesar.neofluxo.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NeoenergiaCorporateAuthService corporateAuthService;

    @Test
    @DisplayName("US-01: Autenticação bem-sucedida de usuário corporativo Neoenergia")
    void testLoginCorporativoSucesso() {
        LoginRequest request = new LoginRequest("carlos.mendes@neoenergia.com", "demo123");
        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertNotNull(response.token());
        assertEquals("carlos.mendes@neoenergia.com", response.user().email());
        assertEquals("PROJETISTA", response.user().role());
    }

    @Test
    @DisplayName("US-01: Rejeição de senha inválida com BadCredentialsException")
    void testLoginSenhaIncorreta() {
        LoginRequest request = new LoginRequest("carlos.mendes@neoenergia.com", "senha-errada-999");
        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("US-01: Rejeição de conta inativa com mensagem de bloqueio")
    void testLoginContaInativa() {
        User u = userRepository.findByEmailIgnoreCase("carlos.mendes@neoenergia.com").orElseThrow();
        u.setActive(false);
        userRepository.save(u);

        LoginRequest request = new LoginRequest("carlos.mendes@neoenergia.com", "demo123");
        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("US-01: Validação de domínios corporativos autorizados")
    void testValidacaoDominioCorporativo() {
        assertTrue(corporateAuthService.isCorporateDomain("engenheiro@neoenergia.com"));
        assertTrue(corporateAuthService.isCorporateDomain("analista@neoenergiape.com"));
        assertFalse(corporateAuthService.isCorporateDomain("usuario@gmail-fake-corp.com"));
        assertFalse(corporateAuthService.isCorporateDomain(null));
    }
}
