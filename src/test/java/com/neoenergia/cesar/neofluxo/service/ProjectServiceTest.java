package com.neoenergia.cesar.neofluxo.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.neoenergia.cesar.neofluxo.dto.ProjectApproveRequest;
import com.neoenergia.cesar.neofluxo.dto.ProjectRejectRequest;
import com.neoenergia.cesar.neofluxo.dto.ProjectResponse;
import com.neoenergia.cesar.neofluxo.dto.ProjectStepRequest;
import com.neoenergia.cesar.neofluxo.dto.TechnicalReviewResponse;
import com.neoenergia.cesar.neofluxo.entity.Project;
import com.neoenergia.cesar.neofluxo.entity.User;
import com.neoenergia.cesar.neofluxo.repository.ProjectRepository;
import com.neoenergia.cesar.neofluxo.repository.TechnicalReviewRepository;
import com.neoenergia.cesar.neofluxo.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class ProjectServiceTest {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TechnicalReviewRepository reviewRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private User projetista;
    private User analista;
    private User outroProjetista;

    @BeforeEach
    void setUp() {
        projetista = userRepository.findByEmailIgnoreCase("carlos.mendes@neoenergia.com")
                .orElseGet(() -> {
                    User u = new User();
                    u.setName("Carlos Mendes");
                    u.setEmail("carlos.mendes@neoenergia.com");
                    u.setPasswordHash(passwordEncoder.encode("demo123"));
                    u.setRole(User.Role.PROJETISTA);
                    u.setDepartment("Projetos Elétricos");
                    u.setActive(true);
                    return userRepository.save(u);
                });

        analista = userRepository.findByEmailIgnoreCase("ana.silva@neoenergia.com")
                .orElseGet(() -> {
                    User u = new User();
                    u.setName("Ana Beatriz Silva");
                    u.setEmail("ana.silva@neoenergia.com");
                    u.setPasswordHash(passwordEncoder.encode("demo123"));
                    u.setRole(User.Role.ANALISTA);
                    u.setDepartment("Análise Técnica");
                    u.setActive(true);
                    return userRepository.save(u);
                });

        outroProjetista = userRepository.findByEmailIgnoreCase("outro.projetista@neoenergia.com")
                .orElseGet(() -> {
                    User u = new User();
                    u.setName("Outro Projetista");
                    u.setEmail("outro.projetista@neoenergia.com");
                    u.setPasswordHash(passwordEncoder.encode("demo123"));
                    u.setRole(User.Role.PROJETISTA);
                    u.setDepartment("Projetos");
                    u.setActive(true);
                    return userRepository.save(u);
                });
    }

    @Test
    @DisplayName("US-04: Criação de rascunho com avanço de etapas e persistência")
    void testCriacaoRascunhoESalvamentoDeEtapas() {
        // Passo 1: Criação inicial de rascunho
        ObjectNode step1Data = objectMapper.createObjectNode();
        step1Data.put("name", "Edifício Solar Imperial");
        step1Data.put("city", "Recife");
        step1Data.put("address", "Rua da Aurora, 500");
        step1Data.put("document", "11.222.333/0001-44");
        step1Data.put("technicalResponsible", "Eng. Carlos Mendes - CREA 12345-PE");

        ProjectResponse created = projectService.create(projetista.getId(), step1Data);
        assertNotNull(created.id());
        assertEquals("rascunho", created.status());
        assertEquals(1, created.currentStep());
        assertEquals("Edifício Solar Imperial", created.data().get("name").asText());

        // Passo 2: Salvamento de unidades consumidoras
        ArrayNode units = objectMapper.createArrayNode();
        ObjectNode u1 = units.addObject();
        u1.put("name", "Apartamentos Tipo A");
        u1.put("unitCount", 8);

        ProjectStepRequest step2Request = new ProjectStepRequest(
                2, step1Data, units, null, null, null, null);
        ProjectResponse savedStep2 = projectService.saveStep(created.id(), projetista.getId(), false, step2Request);

        assertEquals(2, savedStep2.currentStep());
        assertEquals(1, savedStep2.units().size());

        // Passo 3: Retomada posterior do projeto — dados persistem
        ProjectResponse retrieved = projectService.byId(created.id(), projetista.getId(), false);
        assertEquals(2, retrieved.currentStep());
        assertEquals("Edifício Solar Imperial", retrieved.data().get("name").asText());
        assertEquals(1, retrieved.units().size());
    }

    @Test
    @DisplayName("US-04: Validação de etapas com número fora de 1..6 deve falhar")
    void testValidacaoNumeroEtapaInvalido() {
        ProjectResponse created = projectService.create(projetista.getId(), null);
        ProjectStepRequest invalidStep = new ProjectStepRequest(
                7, null, null, null, null, null, null);

        assertThrows(IllegalArgumentException.class, () ->
                projectService.saveStep(created.id(), projetista.getId(), false, invalidStep));
    }

    @Test
    @DisplayName("US-06: Envio de projeto para análise técnica e aprovação com atestado e histórico")
    void testSubmissaoEAprovacaoTecnicaComHistorico() {
        // Criação e preenchimento mínimo
        ObjectNode data = objectMapper.createObjectNode();
        data.put("name", "Complexo Comercial Recife");
        ProjectResponse draft = projectService.create(projetista.getId(), data);

        // Submissão
        ProjectResponse submitted = projectService.submit(draft.id(), projetista.getId());
        assertEquals("enviado_analise", submitted.status());
        assertNotNull(submitted.submittedAt());

        // Aprovação por Analista
        ProjectApproveRequest approveReq = new ProjectApproveRequest(
                "Projeto aprovado de acordo com a norma DIS-NOR-030",
                "Nenhuma pendência encontrada.");
        ProjectResponse approved = projectService.approve(submitted.id(), analista.getId(), approveReq);

        assertEquals("aprovado", approved.status());
        assertNotNull(approved.approvedAt());
        assertNotNull(approved.certificateCode());
        assertNotNull(approved.certificate());

        // Verificação da entidade TechnicalReview persistida
        List<TechnicalReviewResponse> reviewList = projectService.getReviews(draft.id(), analista.getId(), true);
        assertFalse(reviewList.isEmpty(), "Deve persistir entidade TechnicalReview");
        assertEquals("APROVADO", reviewList.get(0).decision());
        assertEquals(analista.getId(), reviewList.get(0).analystId());
    }

    @Test
    @DisplayName("US-06: Reprovação com justificativa obrigatória e persistência no banco")
    void testReprovacaoComJustificativaObrigatoria() {
        ObjectNode data = objectMapper.createObjectNode();
        data.put("name", "Galpão Industrial Jaboatão");
        ProjectResponse draft = projectService.create(projetista.getId(), data);
        projectService.submit(draft.id(), projetista.getId());

        // Reprovação sem motivo deve falhar
        ProjectRejectRequest emptyReasonReq = new ProjectRejectRequest("", "Obs");
        assertThrows(IllegalArgumentException.class, () ->
                projectService.reject(draft.id(), analista.getId(), emptyReasonReq));

        // Reprovação com motivo válido
        ProjectRejectRequest validRejectReq = new ProjectRejectRequest(
                "Incompatibilidade no memorial de cálculo de TUE",
                "Revisar dimensionamento das bombas de incêndio.");
        ProjectResponse rejected = projectService.reject(draft.id(), analista.getId(), validRejectReq);

        assertEquals("reprovado", rejected.status());
        assertNotNull(rejected.rejection());
        assertEquals("Incompatibilidade no memorial de cálculo de TUE", rejected.rejection().get("reason").asText());

        // Verificação de histórico no banco de dados
        List<TechnicalReviewResponse> reviews = projectService.getReviews(draft.id(), analista.getId(), true);
        assertEquals(1, reviews.size());
        assertEquals("REPROVADO", reviews.get(0).decision());
        assertEquals("Incompatibilidade no memorial de cálculo de TUE", reviews.get(0).reason());
    }

    @Test
    @DisplayName("US-06: Projetista comum não pode aprovar seu próprio projeto (Controle de Acesso)")
    void testProjetistaNaoPodeAprovarProjeto() {
        ObjectNode data = objectMapper.createObjectNode();
        data.put("name", "Edifício Teste");
        ProjectResponse draft = projectService.create(projetista.getId(), data);
        projectService.submit(draft.id(), projetista.getId());

        // Tentativa de aprovação pelo próprio projetista (não é ANALISTA nem ADMIN)
        assertThrows(AccessDeniedException.class, () ->
                projectService.approve(draft.id(), projetista.getId(), null));
    }
}
