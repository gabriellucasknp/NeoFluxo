package com.neoenergia.cesar.neofluxo.dto;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.*;
public record ProjectStepRequest(@NotNull @Min(1) @Max(6) Integer step, JsonNode data, JsonNode units, JsonNode serviceLoads, JsonNode calcResult, JsonNode subestacao, JsonNode review) {}
