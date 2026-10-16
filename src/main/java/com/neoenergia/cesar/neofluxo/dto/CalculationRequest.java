package com.neoenergia.cesar.neofluxo.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;

public record CalculationRequest(
    List<JsonNode> units,
    List<JsonNode> serviceLoads
) {}
