package com.neoenergia.cesar.neofluxo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.neoenergia.cesar.neofluxo.dto.CalculationResponse;
import com.neoenergia.cesar.neofluxo.dto.ProjectApproveRequest;
import com.neoenergia.cesar.neofluxo.dto.ProjectRejectRequest;
import com.neoenergia.cesar.neofluxo.dto.ProjectResponse;
import com.neoenergia.cesar.neofluxo.dto.ProjectStepRequest;
import com.neoenergia.cesar.neofluxo.dto.TechnicalReviewResponse;
import com.neoenergia.cesar.neofluxo.entity.Project;
import com.neoenergia.cesar.neofluxo.entity.TechnicalReview;
import com.neoenergia.cesar.neofluxo.entity.User;
import com.neoenergia.cesar.neofluxo.repository.ProjectRepository;
import com.neoenergia.cesar.neofluxo.repository.TechnicalReviewRepository;
import com.neoenergia.cesar.neofluxo.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.Year;
import java.util.List;
import java.util.UUID;

@Service
public class ProjectService {
    private final ProjectRepository projects;
    private final UserRepository users;
    private final TechnicalReviewRepository reviews;
    private final CalculationService calculationService;
    private final ObjectMapper objectMapper;

    public ProjectService(ProjectRepository projects,
                          UserRepository users,
                          TechnicalReviewRepository reviews,
                          CalculationService calculationService,
                          ObjectMapper objectMapper) {
        this.projects = projects;
        this.users = users;
        this.reviews = reviews;
        this.calculationService = calculationService;
        this.objectMapper = objectMapper;
    }

    private User owner(UUID id) {
        return users.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));
    }

    @Transactional
    public ProjectResponse create(UUID userId, JsonNode data) {
        Project p = new Project();
        p.setCode("PE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        p.setProjetista(owner(userId));
        p.setStatus(Project.Status.RASCUNHO);
        p.setCurrentStep(1);
        p.setData(data != null ? data : objectMapper.createObjectNode());
        
        addHistory(p, "Rascunho do projeto criado", owner(userId).getName(), "Etapa 1 iniciada");
        return ProjectResponse.from(projects.save(p));
    }

    public Project get(UUID id) {
        return projects.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Projeto não encontrado"));
    }

    public List<ProjectResponse> all(UUID userId, boolean canReview) {
        List<Project> result = canReview
                ? projects.findAll()
                : projects.findByProjetistaIdOrderByUpdatedAtDesc(userId);
        return result.stream().map(ProjectResponse::from).toList();
    }

    public ProjectResponse byId(UUID id, UUID userId, boolean canReview) {
        Project p = get(id);
        checkOwner(p, userId, canReview);
        return ProjectResponse.from(p);
    }

    private void checkOwner(Project p, UUID userId, boolean canReview) {
        if (!canReview && !p.getProjetista().getId().equals(userId)) {
            throw new AccessDeniedException("Projeto pertence a outro projetista");
        }
    }

    private void requireAnalystOrAdmin(User user) {
        if (user.getRole() != User.Role.ANALISTA && user.getRole() != User.Role.ADMIN) {
            throw new AccessDeniedException("Somente analistas ou administradores podem analisar projetos");
        }
    }

    @Transactional
    public ProjectResponse saveStep(UUID id, UUID userId, boolean admin, ProjectStepRequest r) {
        Project p = get(id);
        checkOwner(p, userId, admin);

        if (p.getStatus() != Project.Status.RASCUNHO && p.getStatus() != Project.Status.REPROVADO) {
            throw new IllegalStateException("Somente projetos em rascunho ou reprovados podem ser editados");
        }

        if (r.step() < 1 || r.step() > 6) {
            throw new IllegalArgumentException("A etapa deve estar entre 1 e 6");
        }

        if (r.data() != null) p.setData(r.data());
        if (r.units() != null) p.setUnits(r.units());
        if (r.serviceLoads() != null) p.setServiceLoads(r.serviceLoads());
        if (r.calcResult() != null) p.setCalcResult(r.calcResult());
        if (r.subestacao() != null) p.setSubestacao(r.subestacao());
        if (r.review() != null) p.setReview(r.review());
        p.setCurrentStep(r.step());

        addHistory(p, "Etapa " + r.step() + " salva", owner(userId).getName(), "Salvamento de rascunho");

        return ProjectResponse.from(projects.save(p));
    }

    @Transactional
    public ProjectResponse submit(UUID id, UUID userId) {
        Project p = get(id);
        checkOwner(p, userId, false);

        if (p.getStatus() != Project.Status.RASCUNHO && p.getStatus() != Project.Status.REPROVADO) {
            throw new IllegalStateException("Somente rascunhos ou projetos reprovados podem ser enviados para análise");
        }
        if (p.getData() == null || p.getData().isNull() || p.getData().isEmpty()) {
            throw new IllegalStateException("Dados de identificação do projeto não preenchidos (Etapa 1)");
        }

        // Auto-calcular demanda se ainda não calculada
        if (p.getCalcResult() == null || p.getCalcResult().isNull() || !p.getCalcResult().has("calculatedDemand")) {
            calculationService.calculateForProject(p);
        }

        boolean resubmission = p.getStatus() == Project.Status.REPROVADO;
        p.setStatus(Project.Status.ENVIADO_ANALISE);
        p.setCurrentStep(6);
        p.setSubmittedAt(Instant.now());
        p.setAnalyzedAt(null);
        p.setApprovedAt(null);

        addHistory(p,
                resubmission ? "Projeto reenviado para análise técnica" : "Projeto enviado para análise técnica",
                owner(userId).getName(),
                "Aguardando parecer da equipe de engenharia");

        return ProjectResponse.from(projects.save(p));
    }

    @Transactional
    public ProjectResponse update(UUID id, UUID userId, boolean admin, JsonNode data) {
        Project p = get(id);
        checkOwner(p, userId, admin);
        p.setData(data);
        return ProjectResponse.from(projects.save(p));
    }

    @Transactional
    public void delete(UUID id, UUID userId, boolean admin) {
        Project p = get(id);
        checkOwner(p, userId, admin);
        if (p.getStatus() != Project.Status.RASCUNHO) {
            throw new IllegalStateException("Somente rascunhos podem ser excluídos");
        }
        projects.delete(p);
    }

    @Transactional
    public ProjectResponse approve(UUID id, UUID analystId, ProjectApproveRequest request) {
        Project p = get(id);
        User analyst = owner(analystId);
        requireAnalystOrAdmin(analyst);

        if (p.getStatus() != Project.Status.ENVIADO_ANALISE && p.getStatus() != Project.Status.EM_ANALISE) {
            throw new IllegalStateException("Somente projetos enviados ou em análise podem ser aprovados");
        }

        Instant now = Instant.now();
        String year = String.valueOf(Year.now().getValue());
        String code = generateCertificateCode(year);
        String uniqueIdentifier = "NEO-AT-" + year + "-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        String validationUrl = "/certificates/validate/" + code;

        ObjectNode certificate = objectMapper.createObjectNode();
        certificate.put("id", UUID.randomUUID().toString());
        certificate.put("code", code);
        certificate.put("projectId", p.getId().toString());
        certificate.put("projectCode", p.getCode());
        certificate.put("issueDate", now.toString());
        certificate.put("uniqueIdentifier", uniqueIdentifier);
        certificate.put("analystId", analyst.getId().toString());
        certificate.put("analystName", analyst.getName());
        certificate.put("validationUrl", validationUrl);
        certificate.put("qrCodeData", validationUrl);

        p.setStatus(Project.Status.APROVADO);
        p.setAnalyzedAt(now);
        p.setApprovedAt(now);
        p.setCertificate(certificate);
        p.setCertificateCode(code);
        p.setRejection(null);

        String justification = (request != null) ? request.getEffectiveJustification() : "Projeto aprovado com parecer favorável de viabilidade técnica.";
        String observations = (request != null && request.observations() != null) ? request.observations() : "";

        // Persistência da entidade TechnicalReview
        TechnicalReview review = new TechnicalReview(
                null,
                p,
                analyst,
                TechnicalReview.Decision.APROVADO,
                justification,
                observations,
                code,
                now
        );
        reviews.save(review);

        addHistory(p, "Projeto aprovado", analyst.getName(), "Parecer Técnico Favorável — Atestado: " + code);

        return ProjectResponse.from(projects.save(p));
    }

    @Transactional
    public ProjectResponse reject(UUID id, UUID analystId, ProjectRejectRequest request) {
        Project p = get(id);
        User analyst = owner(analystId);
        requireAnalystOrAdmin(analyst);

        if (p.getStatus() != Project.Status.ENVIADO_ANALISE && p.getStatus() != Project.Status.EM_ANALISE) {
            throw new IllegalStateException("Somente projetos enviados ou em análise podem ser reprovados");
        }

        if (request.reason() == null || request.reason().trim().isEmpty()) {
            throw new IllegalArgumentException("O motivo da reprovação é obrigatório");
        }

        Instant now = Instant.now();
        ObjectNode rejection = objectMapper.createObjectNode();
        rejection.put("reason", request.reason().trim());
        rejection.put("observations", request.observations() == null ? "" : request.observations().trim());
        rejection.put("analyst", analyst.getName());
        rejection.put("analystId", analyst.getId().toString());
        rejection.put("date", now.toString());

        p.setStatus(Project.Status.REPROVADO);
        p.setAnalyzedAt(now);
        p.setApprovedAt(null);
        p.setRejection(rejection);
        p.setCertificate(null);
        p.setCertificateCode(null);

        // Persistência da entidade TechnicalReview
        TechnicalReview review = new TechnicalReview(
                null,
                p,
                analyst,
                TechnicalReview.Decision.REPROVADO,
                request.reason().trim(),
                request.observations() != null ? request.observations().trim() : "",
                null,
                now
        );
        reviews.save(review);

        addHistory(p, "Projeto reprovado", analyst.getName(), "Parecer Técnico Desfavorável: " + request.reason().trim());

        return ProjectResponse.from(projects.save(p));
    }

    public List<TechnicalReviewResponse> getReviews(UUID id, UUID userId, boolean canReview) {
        Project p = get(id);
        checkOwner(p, userId, canReview);
        return reviews.findByProjectIdOrderByCreatedAtDesc(id).stream()
                .map(TechnicalReviewResponse::from)
                .toList();
    }

    @Transactional
    public ProjectResponse emitAtestado(UUID id, UUID userId, boolean canReview) {
        Project p = get(id);
        User user = owner(userId);
        boolean isOwner = p.getProjetista().getId().equals(userId);
        if (!isOwner && !canReview) {
            throw new AccessDeniedException("Permissão negada para emitir o atestado deste projeto");
        }

        if (p.getCertificateCode() != null && p.getCertificate() != null) {
            return ProjectResponse.from(p);
        }

        if (p.getCalcResult() == null || !p.getCalcResult().has("calculatedDemand")) {
            calculationService.calculateForProject(p);
        }

        Instant now = Instant.now();
        String year = String.valueOf(Year.now().getValue());
        String code = generateCertificateCode(year);
        String uniqueIdentifier = "NEO-AT-" + year + "-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        String validationUrl = "/certificates/validate/" + code;

        ObjectNode certificate = objectMapper.createObjectNode();
        certificate.put("id", UUID.randomUUID().toString());
        certificate.put("code", code);
        certificate.put("projectId", p.getId().toString());
        certificate.put("projectCode", p.getCode());
        certificate.put("issueDate", now.toString());
        certificate.put("uniqueIdentifier", uniqueIdentifier);
        certificate.put("analystId", user.getId().toString());
        certificate.put("analystName", user.getName());
        certificate.put("validationUrl", validationUrl);
        certificate.put("qrCodeData", validationUrl);

        if (p.getStatus() == Project.Status.RASCUNHO) {
            p.setStatus(Project.Status.APROVADO);
        }
        p.setApprovedAt(now);
        p.setCertificate(certificate);
        p.setCertificateCode(code);

        addHistory(p, "Atestado Técnico emitido com sucesso", user.getName(), "Atestado: " + code);
        return ProjectResponse.from(projects.save(p));
    }

    @Transactional
    public CalculationResponse calculateAndAssociate(UUID id, UUID userId, boolean canReview) {
        Project p = get(id);
        checkOwner(p, userId, canReview);

        CalculationResponse response = calculationService.calculateForProject(p);
        projects.save(p);
        return response;
    }

    public JsonNode getCalculationMemory(UUID id, UUID userId, boolean canReview) {
        Project p = get(id);
        checkOwner(p, userId, canReview);
        if (p.getCalcResult() != null && p.getCalcResult().has("calculationMemory")) {
            return p.getCalcResult().get("calculationMemory");
        }
        CalculationResponse response = calculationService.calculateForProject(p);
        projects.save(p);
        return objectMapper.valueToTree(response.calculationMemory());
    }

    private String generateCertificateCode(String year) {
        String code;
        do {
            code = "AT-" + year + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (projects.existsByCertificateCode(code));
        return code;
    }

    private void addHistory(Project project, String action, String user, String detail) {
        ArrayNode history;
        if (project.getHistory() != null && project.getHistory().isArray()) {
            history = (ArrayNode) project.getHistory();
        } else {
            history = objectMapper.createArrayNode();
        }

        ObjectNode item = objectMapper.createObjectNode();
        item.put("id", UUID.randomUUID().toString());
        item.put("date", Instant.now().toString());
        item.put("action", action);
        item.put("user", user == null ? "" : user);
        if (detail != null) item.put("detail", detail);

        history.add(item);
        project.setHistory(history);
    }
}
