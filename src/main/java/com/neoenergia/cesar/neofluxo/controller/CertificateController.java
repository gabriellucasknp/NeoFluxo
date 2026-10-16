package com.neoenergia.cesar.neofluxo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.neoenergia.cesar.neofluxo.entity.Project;
import com.neoenergia.cesar.neofluxo.repository.ProjectRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/certificates")
public class CertificateController {

    private final ProjectRepository projectRepository;
    private final ObjectMapper objectMapper;

    public CertificateController(ProjectRepository projectRepository, ObjectMapper objectMapper) {
        this.projectRepository = projectRepository;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/validate/{code}")
    public ResponseEntity<?> validate(@PathVariable String code) {
        Optional<Project> opt = projectRepository.findAll().stream()
                .filter(p -> p.getCertificateCode() != null && p.getCertificateCode().equalsIgnoreCase(code)
                        || (p.getCertificate() != null && p.getCertificate().has("uniqueIdentifier")
                        && p.getCertificate().get("uniqueIdentifier").asText("").equalsIgnoreCase(code)))
                .findFirst();

        if (opt.isEmpty() || opt.get().getCertificate() == null) {
            ObjectNode notFound = objectMapper.createObjectNode();
            notFound.put("valid", false);
            notFound.put("message", "Atestado não encontrado ou código inválido");
            return ResponseEntity.status(404).body(notFound);
        }

        Project p = opt.get();
        ObjectNode response = objectMapper.createObjectNode();
        response.put("valid", true);
        response.set("certificate", p.getCertificate());

        ObjectNode projectInfo = objectMapper.createObjectNode();
        projectInfo.put("id", p.getId().toString());
        projectInfo.put("code", p.getCode());
        projectInfo.put("name", p.getData() != null && p.getData().has("name") ? p.getData().get("name").asText("") : "");
        projectInfo.put("technicalResponsible", p.getData() != null && p.getData().has("technicalResponsible") ? p.getData().get("technicalResponsible").asText("") : "");
        projectInfo.put("calculatedDemand", p.getCalcResult() != null && p.getCalcResult().has("calculatedDemand") ? p.getCalcResult().get("calculatedDemand").asDouble(0.0) : 0.0);
        projectInfo.put("enquadramento", p.getCalcResult() != null && p.getCalcResult().has("enquadramento") ? p.getCalcResult().get("enquadramento").asText("baixa_tensao") : "baixa_tensao");
        projectInfo.put("normaAplicada", p.getCalcResult() != null && p.getCalcResult().has("normaAplicada") ? p.getCalcResult().get("normaAplicada").asText("DIS-NOR-030") : "DIS-NOR-030");
        projectInfo.put("approvedAt", p.getApprovedAt() != null ? p.getApprovedAt().toString() : "");

        response.set("project", projectInfo);
        return ResponseEntity.ok(response);
    }
}
