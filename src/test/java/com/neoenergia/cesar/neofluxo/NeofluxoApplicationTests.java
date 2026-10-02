package com.neoenergia.cesar.neofluxo;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class NeofluxoApplicationTests {

	@Test
	void contextLoads() {

	}
	@Test void criarRascunho_avancaParaPasso2_eStatusRascunho() { /* POST /api/projetos -> 201, passoAtual=2, status=RASCUNHO */ }
	@Test void retomar_devolvePassoAtualEDadosPreenchidos()      { /* salvar passo 3, GET -> passoAtual=4 e passos[3] */ }
	@Test void aprovar_mudaStatus_emiteAtestado_registraHistorico() { }
	@Test void reprovar_semMotivo_retorna400_comMensagem()       { /* motivos=[] -> "Selecione um motivo." */ }

}
