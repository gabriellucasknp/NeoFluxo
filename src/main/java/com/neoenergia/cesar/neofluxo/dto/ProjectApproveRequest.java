package com.neoenergia.cesar.neofluxo.dto;

public record ProjectApproveRequest(
        String justification,
        String observations
) {
    public String getEffectiveJustification() {
        if (justification != null && !justification.trim().isEmpty()) {
            return justification.trim();
        }
        return "Conformidade técnica atestada com os critérios regulamentares DIS-NOR-030 e DIS-NOR-053 da Neoenergia Pernambuco.";
    }
}
