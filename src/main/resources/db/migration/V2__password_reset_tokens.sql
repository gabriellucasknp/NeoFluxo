-- Flyway Migration V2: tokens de redefinição de senha (US-02)
-- Guarda só o SHA-256 do token (o token em si vai apenas no link do e-mail).
-- Vale 60 minutos e é de uso único; pedir um novo apaga os anteriores não usados.

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BINARY(16) NOT NULL PRIMARY KEY,
    user_id BINARY(16) NOT NULL,
    token_hash CHAR(64) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_password_reset_tokens_hash UNIQUE (token_hash),
    CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
