package com.neoenergia.cesar.neofluxo.dto;

import jakarta.validation.constraints.NotBlank;

public record ProjectRejectRequest(
        @NotBlank(message = "O motivo da reprovação é obrigatório") String reason,
        String observations
) {}
