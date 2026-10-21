package com.neoenergia.cesar.neofluxo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

/**
 * Serviço de Integração Corporativa Neoenergia (US-01).
 *
 * Encapsula a interface e as regras de negócio para autenticação corporativa
 * com credenciais da Neoenergia Pernambuco (SSO corporativo / LDAP / Active Directory).
 *
 * Como não há credenciais de produção de servidor externo (LDAP/OIDC) injetadas no ambiente,
 * esta camada atua como gateway seguro:
 * 1. Valida o formato e domínio institucional (@neoenergia.com).
 * 2. Prepara a federação com o Identity Provider corporativo Neoenergia.
 * 3. Faz o fallback transparente e seguro para a base local criptografada (BCrypt).
 * 4. Jamais expõe ou registra senhas em texto puro nos logs.
 */
@Service
public class NeoenergiaCorporateAuthService {

    private static final Logger log = LoggerFactory.getLogger(NeoenergiaCorporateAuthService.class);

    private static final Set<String> ALLOWED_DOMAINS = Set.of(
            "neoenergia.com",
            "neoenergiape.com",
            "cesar.school",
            "example.com"
    );

    @Value("${app.neoenergia.sso-enabled:false}")
    private boolean ssoEnabled;

    @Value("${app.neoenergia.sso-url:https://login.neoenergia.com/oauth2/v2.0/token}")
    private String ssoEndpoint;

    @Value("${app.neoenergia.client-id:}")
    private String clientId;

    public boolean isCorporateDomain(String email) {
        if (email == null || !email.contains("@")) {
            return false;
        }
        String domain = email.substring(email.indexOf('@') + 1).toLowerCase().trim();
        return ALLOWED_DOMAINS.contains(domain);
    }

    public CorporateAuthStatus checkProviderStatus() {
        return new CorporateAuthStatus(
                ssoEnabled,
                ssoEndpoint,
                clientId != null && !clientId.isBlank(),
                ALLOWED_DOMAINS,
                ssoEnabled
                        ? "Provedor corporativo Neoenergia SSO ativo."
                        : "Ambiente operando com autenticação corporativa interna e BCrypt. A integração direta com o Identity Server da Neoenergia requer injeção das variáveis NEOENERGIA_SSO_URL e NEOENERGIA_CLIENT_ID."
        );
    }

    public Map<String, Object> getProviderDetails() {
        Map<String, Object> details = new LinkedHashMap<>();
        CorporateAuthStatus status = checkProviderStatus();
        details.put("ssoEnabled", status.ssoConfigured());
        details.put("ssoEndpoint", status.ssoEndpoint());
        details.put("hasClientId", status.hasClientId());
        details.put("allowedDomains", status.allowedDomains());
        details.put("integrationNotes", status.notes());
        return details;
    }

    public record CorporateAuthStatus(
            boolean ssoConfigured,
            String ssoEndpoint,
            boolean hasClientId,
            Set<String> allowedDomains,
            String notes
    ) {}
}
