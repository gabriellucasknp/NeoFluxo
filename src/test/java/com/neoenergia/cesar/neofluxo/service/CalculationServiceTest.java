package com.neoenergia.cesar.neofluxo.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.neoenergia.cesar.neofluxo.dto.CalculationRequest;
import com.neoenergia.cesar.neofluxo.dto.CalculationResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CalculationServiceTest {

    private CalculationService calculationService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        calculationService = new CalculationService(objectMapper);
    }

    @Test
    @DisplayName("Cenário 1: Carga residencial leve deve ser enquadrada em Baixa Tensão (DIS-NOR-030)")
    void testCalculoCargaBaixaTensao() {
        // Unidade com iluminação (1000W) e TUG (2000W)
        ObjectNode group = objectMapper.createObjectNode();
        group.put("name", "Apartamentos Tipo");
        group.put("unitCount", 5);

        ArrayNode loads = group.putArray("loads");
        ObjectNode ilum = loads.addObject();
        ilum.put("type", "iluminacao");
        ilum.put("label", "Lâmpadas LED");
        ilum.put("quantity", 10);
        ilum.put("powerPerUnit", 100.0); // 1000W total -> fator 1.0 (1 kW)

        ObjectNode tug = loads.addObject();
        tug.put("type", "tug");
        tug.put("label", "Tomadas de Uso Geral");
        tug.put("quantity", 10);
        tug.put("powerPerUnit", 150.0); // 1500W total -> fator 0.8 (1.2 kW)

        CalculationRequest request = new CalculationRequest(List.of(group), List.of());
        CalculationResponse response = calculationService.calculate(request);

        assertNotNull(response);
        assertEquals(5, response.unitCount());
        assertTrue(response.calculatedDemand() <= 75.0, "Demanda deve ser <= 75 kW");
        assertEquals("baixa_tensao", response.enquadramento());
        assertEquals("DIS-NOR-030", response.normaAplicada());
        assertFalse(response.needsSubstation(), "Não deve exigir subestação particular");
        assertFalse(response.calculationMemory().isEmpty(), "Memória de cálculo deve conter itens auditáveis");
    }

    @Test
    @DisplayName("Cenário 2: Carga pesada acima de 75 kW deve ser enquadrada em Média Tensão (DIS-NOR-053)")
    void testCalculoCargaMediaTensaoExigeSubestacao() {
        // Carga de serviço pesada com múltiplos motores e elevadores que ultrapassa 75 kW
        ObjectNode serviceLoad = objectMapper.createObjectNode();
        serviceLoad.put("category", "bombas");
        serviceLoad.put("name", "Bombas de Recalque e Incêndio");
        serviceLoad.put("quantity", 4);
        serviceLoad.put("power", 30000.0); // 120.000 W -> fator 0.85 = 102 kW de demanda

        CalculationRequest request = new CalculationRequest(List.of(), List.of(serviceLoad));
        CalculationResponse response = calculationService.calculate(request);

        assertNotNull(response);
        assertTrue(response.calculatedDemand() > 75.0, "Demanda deve ultrapassar 75 kW");
        assertEquals("media_tensao", response.enquadramento());
        assertEquals("DIS-NOR-053", response.normaAplicada());
        assertTrue(response.needsSubstation(), "Deve exigir subestação particular em MT");
        assertNotNull(response.recommendedTransformerKva(), "Deve recomendar potência de transformador padronizado");
        assertTrue(response.recommendedTransformerKva() >= response.calculatedDemandKva());
    }

    @Test
    @DisplayName("Cenário 3: Validação de entradas inválidas com potência negativa deve lançar exceção")
    void testValidacaoPotenciaNegativa() {
        ObjectNode group = objectMapper.createObjectNode();
        group.put("name", "Grupo Inválido");
        group.put("unitCount", 1);

        ArrayNode loads = group.putArray("loads");
        ObjectNode invalidLoad = loads.addObject();
        invalidLoad.put("type", "motor");
        invalidLoad.put("quantity", 1);
        invalidLoad.put("powerPerUnit", -500.0); // Potência negativa inválida

        CalculationRequest request = new CalculationRequest(List.of(group), List.of());

        assertThrows(IllegalArgumentException.class, () -> calculationService.calculate(request));
    }

    @Test
    @DisplayName("Cenário 4: Limite normativo exato de 75.0 kW")
    void testLimiteNormativo75kW() {
        assertEquals(75.0, CalculationService.DEMAND_LIMIT_KW);
        var rules = calculationService.getNormativeRules();
        assertNotNull(rules);
        assertTrue(rules.containsKey("limiteBaixaTensaoKw"));
        assertEquals(75.0, rules.get("limiteBaixaTensaoKw"));
    }
}
