package com.neoenergia.cesar.neofluxo.dto;

public record CalculationMemoryItem(
    String group,
    String category,
    String description,
    int unitsAffected,
    double individualPowerW,
    double totalPowerKw,
    double demandFactor,
    String ruleReference,
    double resultDemandKw
) {}
