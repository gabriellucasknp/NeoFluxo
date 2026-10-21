package com.neoenergia.cesar.neofluxo.dto;

import com.neoenergia.cesar.neofluxo.entity.TechnicalReview;
import java.time.Instant;
import java.util.UUID;

public record TechnicalReviewResponse(
        UUID id,
        UUID projectId,
        String projectCode,
        UUID analystId,
        String analystName,
        String decision,
        String reason,
        String observations,
        String certificateCode,
        Instant createdAt
) {
    public static TechnicalReviewResponse from(TechnicalReview r) {
        return new TechnicalReviewResponse(
                r.getId(),
                r.getProject().getId(),
                r.getProject().getCode(),
                r.getAnalyst().getId(),
                r.getAnalyst().getName(),
                r.getDecision().name(),
                r.getReason(),
                r.getObservations(),
                r.getCertificateCode(),
                r.getCreatedAt()
        );
    }
}
