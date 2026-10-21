package com.neoenergia.cesar.neofluxo;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.neoenergia.cesar.neofluxo.dto.ProjectApproveRequest;
import com.neoenergia.cesar.neofluxo.dto.ProjectRejectRequest;
import com.neoenergia.cesar.neofluxo.dto.ProjectResponse;
import com.neoenergia.cesar.neofluxo.dto.ProjectStepRequest;
import com.neoenergia.cesar.neofluxo.entity.User;
import com.neoenergia.cesar.neofluxo.repository.UserRepository;
import com.neoenergia.cesar.neofluxo.service.ProjectService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class NeofluxoApplicationTests {

	@Autowired
	private ProjectService projectService;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private ObjectMapper mapper;

	private User projetista;
	private User analista;

	@BeforeEach
	void setUp() {
		projetista = userRepository.findByEmailIgnoreCase("carlos.mendes@neoenergia.com").orElseThrow();
		analista = userRepository.findByEmailIgnoreCase("ana.silva@neoenergia.com").orElseThrow();
	}

	@Test
	void contextLoads() {
		assertNotNull(projectService);
		assertNotNull(userRepository);
	}

	@Test
	void criarRascunho_avancaParaPasso2_eStatusRascunho() {
		ObjectNode data = mapper.createObjectNode();
		data.put("name", "Residencial Teste Passo 1");

		ProjectResponse p = projectService.create(projetista.getId(), data);
		assertNotNull(p.id());
		assertEquals("rascunho", p.status());
		assertEquals(1, p.currentStep());

		ProjectStepRequest step2 = new ProjectStepRequest(2, data, mapper.createArrayNode(), null, null, null, null);
		ProjectResponse updated = projectService.saveStep(p.id(), projetista.getId(), false, step2);

		assertEquals(2, updated.currentStep());
		assertEquals("rascunho", updated.status());
	}

	@Test
	void retomar_devolvePassoAtualEDadosPreenchidos() {
		ObjectNode data = mapper.createObjectNode();
		data.put("name", "Edifício Retomada");
		data.put("city", "Recife");

		ProjectResponse p = projectService.create(projetista.getId(), data);
		ProjectStepRequest step3 = new ProjectStepRequest(3, data, null, mapper.createArrayNode(), null, null, null);
		projectService.saveStep(p.id(), projetista.getId(), false, step3);

		ProjectResponse retomado = projectService.byId(p.id(), projetista.getId(), false);
		assertEquals(3, retomado.currentStep());
		assertEquals("Edifício Retomada", retomado.data().get("name").asText());
		assertEquals("Recife", retomado.data().get("city").asText());
	}

	@Test
	void aprovar_mudaStatus_emiteAtestado_registraHistorico() {
		ObjectNode data = mapper.createObjectNode();
		data.put("name", "Projeto para Aprovação");

		ProjectResponse p = projectService.create(projetista.getId(), data);
		projectService.submit(p.id(), projetista.getId());

		ProjectApproveRequest req = new ProjectApproveRequest("Aprovado tecnicamente", "Sem pendências");
		ProjectResponse approved = projectService.approve(p.id(), analista.getId(), req);

		assertEquals("aprovado", approved.status());
		assertNotNull(approved.certificateCode());
		assertTrue(approved.certificateCode().startsWith("AT-"));
		assertNotNull(approved.certificate());
		assertTrue(approved.history().size() > 0);
	}

	@Test
	void reprovar_semMotivo_retorna400_comMensagem() {
		ObjectNode data = mapper.createObjectNode();
		data.put("name", "Projeto para Reprovação");

		ProjectResponse p = projectService.create(projetista.getId(), data);
		projectService.submit(p.id(), projetista.getId());

		ProjectRejectRequest req = new ProjectRejectRequest("", "Sem justificativa");
		IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
				projectService.reject(p.id(), analista.getId(), req));

		assertTrue(ex.getMessage().contains("motivo da reprovação é obrigatório"));
	}

}
