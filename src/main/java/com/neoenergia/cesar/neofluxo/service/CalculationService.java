package com.neoenergia.cesar.neofluxo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.neoenergia.cesar.neofluxo.dto.CalculationMemoryItem;
import com.neoenergia.cesar.neofluxo.dto.CalculationRequest;
import com.neoenergia.cesar.neofluxo.dto.CalculationResponse;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class CalculationService {

    public static final double DEMAND_LIMIT_KW = 75.0;

    public CalculationResponse calculate(CalculationRequest request) {
        List<CalculationMemoryItem> memory = new ArrayList<>();
        double totalInstalledW = 0.0;
        double totalUnitDemandW = 0.0;
        int totalUnits = 0;

        if (request.units() != null) {
            for (JsonNode group : request.units()) {
                int unitCount = group.has("unitCount") ? group.get("unitCount").asInt(1) : 1;
                String groupName = group.has("name") ? group.get("name").asText("Grupo") : "Grupo";
                totalUnits += unitCount;

                double groupUnitInstalledW = 0.0;
                double groupUnitDemandW = 0.0;

                if (group.has("loads") && group.get("loads").isArray()) {
                    for (JsonNode load : group.get("loads")) {
                        int qty = load.has("quantity") ? load.get("quantity").asInt(1) : 1;
                        double powerPerUnit = load.has("powerPerUnit") ? load.get("powerPerUnit").asDouble(0.0) : 0.0;
                        String type = load.has("type") ? load.get("type").asText("outros") : "outros";
                        String label = load.has("label") ? load.get("label").asText("Carga") : "Carga";

                        double loadTotalW = qty * powerPerUnit;
                        groupUnitInstalledW += loadTotalW;

                        double factor = getDemandFactor(type, loadTotalW);
                        String ruleRef = "DIS-NOR-030: Fator " + (int)(factor * 100) + "% para " + type;
                        double loadDemandW = loadTotalW * factor;
                        groupUnitDemandW += loadDemandW;

                        memory.add(new CalculationMemoryItem(
                            groupName,
                            type,
                            label + " (" + qty + "x " + powerPerUnit + "W)",
                            unitCount,
                            loadTotalW,
                            round((loadTotalW * unitCount) / 1000.0),
                            factor,
                            ruleRef,
                            round((loadDemandW * unitCount) / 1000.0)
                        ));
                    }
                }

                totalInstalledW += groupUnitInstalledW * unitCount;
                totalUnitDemandW += groupUnitDemandW * unitCount;
            }
        }

        double serviceInstalledW = 0.0;
        double serviceDemandW = 0.0;

        if (request.serviceLoads() != null) {
            for (JsonNode load : request.serviceLoads()) {
                int qty = load.has("quantity") ? load.get("quantity").asInt(1) : 1;
                double power = load.has("power") ? load.get("power").asDouble(0.0) : 0.0;
                String category = load.has("category") ? load.get("category").asText("outros") : "outros";
                String name = load.has("name") ? load.get("name").asText("Serviço") : "Serviço";

                double sPowerW = qty * power;
                serviceInstalledW += sPowerW;

                double factor = getServiceDemandFactor(category);
                String ruleRef = "DIS-NOR-030 (Áreas Comuns): Fator " + (int)(factor * 100) + "% para " + category;
                double sDemandW = sPowerW * factor;
                serviceDemandW += sDemandW;

                memory.add(new CalculationMemoryItem(
                    "Cargas de Serviço / Condomínio",
                    category,
                    name + " (" + qty + "x " + power + "W)",
                    1,
                    sPowerW,
                    round(sPowerW / 1000.0),
                    factor,
                    ruleRef,
                    round(sDemandW / 1000.0)
                ));
            }
        }

        double totalInstalledKw = round((totalInstalledW + serviceInstalledW) / 1000.0);
        double calculatedDemandKw = round((totalUnitDemandW + serviceDemandW) / 1000.0);
        double unitDemandKw = round(totalUnitDemandW / 1000.0);
        double serviceDemandKw = round(serviceDemandW / 1000.0);

        boolean isLowVoltage = calculatedDemandKw <= DEMAND_LIMIT_KW;
        String enquadramento = isLowVoltage ? "baixa_tensao" : "media_tensao";
        String normaAplicada = isLowVoltage ? "DIS-NOR-030" : "DIS-NOR-053";
        boolean needsSubstation = !isLowVoltage;

        return new CalculationResponse(
            totalInstalledKw,
            calculatedDemandKw,
            totalUnits,
            unitDemandKw,
            serviceDemandKw,
            enquadramento,
            normaAplicada,
            needsSubstation,
            memory,
            Instant.now().toString()
        );
    }

    private double getDemandFactor(String type, double powerW) {
        if ("iluminacao".equalsIgnoreCase(type)) {
            if (powerW <= 1000) return 1.0;
            if (powerW <= 2000) return 0.80;
            if (powerW <= 3000) return 0.65;
            return 0.55;
        } else if ("tug".equalsIgnoreCase(type)) {
            if (powerW <= 1000) return 1.0;
            if (powerW <= 2000) return 0.80;
            if (powerW <= 3000) return 0.60;
            return 0.40;
        } else if ("tue".equalsIgnoreCase(type)) {
            return 1.0;
        } else if ("motor".equalsIgnoreCase(type)) {
            return 0.75;
        }
        return 0.80;
    }

    private double getServiceDemandFactor(String category) {
        if ("elevadores".equalsIgnoreCase(category)) return 0.75;
        if ("bombas".equalsIgnoreCase(category)) return 0.85;
        if ("motores".equalsIgnoreCase(category)) return 0.75;
        if ("seguranca".equalsIgnoreCase(category)) return 1.0;
        if ("iluminacao_comum".equalsIgnoreCase(category)) return 0.90;
        if ("portoes".equalsIgnoreCase(category)) return 0.50;
        return 0.80;
    }

    private double round(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}
