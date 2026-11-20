package com.neoenergia.cesar.neofluxo.dto;

import com.neoenergia.cesar.neofluxo.service.PasswordResetService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Política de senha = a mesma do cadastro (RegisterRequest): mínimo de 6 caracteres. */
public record ResetPasswordRequest(
    @NotBlank(message = "O link de redefinição é inválido. Solicite um novo em \"Esqueci minha senha\".")
    String token,

    @NotBlank(message = "A senha é obrigatória")
    @Size(min = PasswordResetService.SENHA_MINIMA, message = "A senha deve ter no mínimo 6 caracteres")
    String password
) {}
