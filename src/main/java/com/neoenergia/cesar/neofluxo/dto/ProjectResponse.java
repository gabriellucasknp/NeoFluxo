package com.neoenergia.cesar.neofluxo.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.neoenergia.cesar.neofluxo.entity.Project;

import java.time.Instant;
import java.util.UUID;

public record ProjectResponse(
        UUID id,
        String code,
        UUID projetistaId,
        String projetistaName,
        String status,
        Integer currentStep,
        JsonNode data,
        JsonNode units,
        JsonNode serviceLoads,
        JsonNode calcResult,
        JsonNode subestacao,
        JsonNode review,
        JsonNode rejection,
        JsonNode history,
        JsonNode certificate,
        JsonNode atestado,
        Instant createdAt,
        Instant updatedAt,
        Instant submittedAt,
        Instant analyzedAt,
        Instant approvedAt
) {
    public static ProjectResponse from(Project p) {
        return new ProjectResponse(
                p.getId(), p.getCode(), p.getProjetista().getId(), p.getProjetista().getName(),
                p.getStatus().name().toLowerCase(), p.getCurrentStep(), p.getData(), p.getUnits(),
                p.getServiceLoads(), p.getCalcResult(), p.getSubestacao(), p.getReview(),
                p.getRejection(), p.getHistory(), p.getCertificate(), p.getCertificate(), p.getCreatedAt(),
                p.getUpdatedAt(), p.getSubmittedAt(), p.getAnalyzedAt(), p.getApprovedAt()
        );
    }
}
