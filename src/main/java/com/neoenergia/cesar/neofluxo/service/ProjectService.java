package com.neoenergia.cesar.neofluxo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.neoenergia.cesar.neofluxo.dto.ProjectRejectRequest;
import com.neoenergia.cesar.neofluxo.dto.ProjectResponse;
import com.neoenergia.cesar.neofluxo.dto.ProjectStepRequest;
import com.neoenergia.cesar.neofluxo.entity.Project;
import com.neoenergia.cesar.neofluxo.entity.User;
import com.neoenergia.cesar.neofluxo.repository.ProjectRepository;
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
    private final ObjectMapper objectMapper;

    public ProjectService(ProjectRepository projects, UserRepository users, ObjectMapper objectMapper) {
        this.projects = projects;
        this.users = users;
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
        p.setData(data);
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
            throw new IllegalStateException("Somente projetos em rascunho/reprovados podem ser editados");
        }

        if (r.data() != null) p.setData(r.data());
        if (r.units() != null) p.setUnits(r.units());
        if (r.serviceLoads() != null) p.setServiceLoads(r.serviceLoads());
        if (r.calcResult() != null) p.setCalcResult(r.calcResult());
        if (r.subestacao() != null) p.setSubestacao(r.subestacao());
        if (r.review() != null) p.setReview(r.review());
        p.setCurrentStep(r.step());

        return ProjectResponse.from(projects.save(p));
    }

    @Transactional
    public ProjectResponse submit(UUID id, UUID userId) {
        Project p = get(id);
        checkOwner(p, userId, false);

        if (p.getStatus() != Project.Status.RASCUNHO && p.getStatus() != Project.Status.REPROVADO) {
            throw new IllegalStateException("Somente rascunhos ou projetos reprovados podem ser enviados");
        }
        if (p.getData() == null) {
            throw new IllegalStateException("Dados do projeto não preenchidos");
        }

        boolean resubmission = p.getStatus() == Project.Status.REPROVADO;
        p.setStatus(Project.Status.ENVIADO_ANALISE);
        p.setCurrentStep(6);
        p.setSubmittedAt(Instant.now());
        p.setAnalyzedAt(null);
        p.setApprovedAt(null);
        p.setRejection(null);
        p.setCertificate(null);
        p.setCertificateCode(null);

        addHistory(p,
                resubmission ? "Projeto reenviado para análise" : "Projeto enviado para análise",
                owner(userId).getName(),
                null);

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
    public ProjectResponse approve(UUID id, UUID analystId) {
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
        String validationUrl = "/api/certificates/validate/" + code;

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

        addHistory(p, "Projeto aprovado", analyst.getName(), "Atestado: " + code);

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

        Instant now = Instant.now();
        ObjectNode rejection = objectMapper.createObjectNode();
        rejection.put("reason", request.reason());
        rejection.put("observations", request.observations() == null ? "" : request.observations());
        rejection.put("analyst", analyst.getName());
        rejection.put("analystId", analyst.getId().toString());
        rejection.put("date", now.toString());

        p.setStatus(Project.Status.REPROVADO);
        p.setAnalyzedAt(now);
        p.setApprovedAt(null);
        p.setRejection(rejection);
        p.setCertificate(null);
        p.setCertificateCode(null);

        addHistory(p, "Projeto reprovado", analyst.getName(), request.reason());

        return ProjectResponse.from(projects.save(p));
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
