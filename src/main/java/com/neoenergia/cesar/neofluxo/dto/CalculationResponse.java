package com.neoenergia.cesar.neofluxo.dto;

import java.util.List;

public record CalculationResponse(
    double totalInstalledPower,
    double calculatedDemand,
    int unitCount,
    double unitDemand,
    double serviceDemand,
    String enquadramento,
    String normaAplicada,
    boolean needsSubstation,
    List<CalculationMemoryItem> calculationMemory,
    String calculatedAt,
    double calculatedDemandKva,
    double powerFactor,
    Double recommendedTransformerKva,
    double simultaneityFactor
) {
    public CalculationResponse(
        double totalInstalledPower,
        double calculatedDemand,
        int unitCount,
        double unitDemand,
        double serviceDemand,
        String enquadramento,
        String normaAplicada,
        boolean needsSubstation,
        List<CalculationMemoryItem> calculationMemory,
        String calculatedAt
    ) {
        this(
            totalInstalledPower,
            calculatedDemand,
            unitCount,
            unitDemand,
            serviceDemand,
            enquadramento,
            normaAplicada,
            needsSubstation,
            calculationMemory,
            calculatedAt,
            Math.round((calculatedDemand / 0.92) * 100.0) / 100.0,
            0.92,
            needsSubstation ? recommendTransformer(calculatedDemand / 0.92) : null,
            totalInstalledPower > 0 ? Math.round((calculatedDemand / totalInstalledPower) * 1000.0) / 1000.0 : 1.0
        );
    }

    private static Double recommendTransformer(double demandKva) {
        double[] standards = {75.0, 112.5, 150.0, 225.0, 300.0, 500.0, 750.0, 1000.0};
        for (double s : standards) {
            if (s >= demandKva) return s;
        }
        return 1000.0;
    }
}
