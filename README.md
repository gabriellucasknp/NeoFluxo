# Portal de Projetos Elétricos - Neoenergia Pernambuco

## 📖 Descrição do Projeto
O Portal de Projetos Elétricos é uma solução desenvolvida pela equipe **Neofluxo** voltada para a otimização, submissão e análise de projetos elétricos da Neoenergia Pernambuco. O sistema permite que projetistas criem memoriais de carga, calculem demandas e enquadramentos (Baixa ou Média Tensão) de forma automatizada. Além disso, fornece aos analistas da Neoenergia um painel para aprovação/reprovação técnica e gera um atestado digital autêntico (via QR Code) para consumidores e terceiros.

## 👥 Equipe Neofluxo

| Nome Completo | Papel no Projeto | E-mail (Cesar School) |
| :--- | :--- | :--- |
| **Kaio Cerqueira** | Scrum Master | kcss@cesar.school |
| **Mateus Xavier** | Product Owner | mxrr@cesar.school |
| **Felipe Ulisses** | Desenvolvedor Front-End | fucaa@cesar.school |
| **Jailson de Souza** | Desenvolvedor Front-End | jsj3@cesar.school |
| **Lucas Rogério** | Desenvolvedor Front-End | lrmb@cesar.school |
| **Gabriel Dias** | Desenvolvedor Back-End | gdmm@cesar.school |
| **Lucas Farias** | QA / Desenvolvedor Back-End | lcf2@cesar.school |
| **Gabriel Lucas** | Desenvolvedor Back-End / DevOps | glss@cesar.school |


## 🛠 Tecnologias Usadas
* **Design e Prototipação:** Figma e Miro
* **Front-end:** TypeScript / JavaScript & React JS
* **Back-end:** Java & Spring Boot
* **Banco de Dados:** MySQL
* **Conteinerização:** Docker
* **Deployment:** Render
* **Versionamento de Código:** Git & GitHub
* **IDEs:** VS Code & IntelliJ

---

## 🚀 Entregas

### Entrega 01: Concepção, Histórias de Usuário e Protótipo Lo-Fi

# Histórias de Usuário - Portal de Projetos Elétricos

## Perfis de Usuário
* **Projetista:** Engenheiro eletricista que submete o projeto; monta o memorial de cargas e envia para análise.
* **Analista:** Analista técnico da Neoenergia; aprova ou reprova o projeto.
* **Administrador:** Responsável pela norma e parâmetros; gerencia usuários, fatores de demanda e transformadores.
* **Consumidor / terceiro:** Sem login; valida a autenticidade do atestado.

---

## US-01 — Entrar com credenciais Neoenergia
**Como** projetista, analista ou administrador cadastrado no portal corporativo da Neoenergia  
**Eu quero** entrar no Portal de Projetos Elétricos usando o mesmo e-mail e senha já utilizados  
**Para que** eu acesse diretamente a área do meu perfil, sem gerenciar mais uma senha.

* **Cenário 1: Projetista entra e cai no painel dele**
  * **Dado** que estou na tela de login
  * **E** tenho conta ativa com perfil projetista no Portal de Projetos
  * **Quando** preencho e-mail e senha corretos e clico em "Entrar"
  * **Então** sou levado para o painel do projetista com o menu lateral habilitado.

* **Cenário 2: Analista cai na fila de análise**
  * **Dado** que estou na tela de login
  * **E** minha conta tem perfil analista
  * **Quando** autentico com sucesso
  * **Então** sou levado para o "Painel do Analista", e não para o dashboard de projetista.

---

## US-02 — Recuperar o acesso / senha
**Como** projetista que acessa o portal poucas vezes por mês e esqueceu a senha  
**Eu quero** solicitar um link de redefinição pelo e-mail corporativo e cadastrar uma nova senha  
**Para que** eu volte a submeter projetos no mesmo dia, sem precisar abrir chamado no suporte.

* **Cenário 1: Solicitar o link**
  * **Dado** que estou na tela de login e não lembro minha senha
  * **Quando** clico em "Esqueci minha senha", informo meu e-mail corporativo e confirmo
  * **Então** recebo o e-mail com o link de redefinição em até 5 minutos.

* **Cenário 2: Redefinir com token válido**
  * **Dado** que recebi o e-mail de redefinição há menos de 60 minutos
  * **Quando** abro o link, informo a nova senha atendendo à política e confirmo
  * **Então** vejo "Senha redefinida com sucesso" e sou levado ao login.

---

## US-03 — Provisionar novo usuário
**Como** administrador do Portal de Projetos Elétricos  
**Eu quero** cadastrar um novo usuário informando nome, e-mail corporativo, perfil e departamento  
**Para que** o profissional passe a acessar o sistema já com as permissões corretas do seu papel, sem depender da TI.

* **Cenário 1: Cadastrar novo projetista**
  * **Dado** que estou logado como administrador
  * **Quando** clico em "Novo Usuário", preencho os dados com o perfil "Projetista" e salvo
  * **Então** o usuário aparece na lista com status Ativo e passa a autenticar com o perfil correto.

* **Cenário 2: Alterar o perfil de um usuário**
  * **Dado** que estou logado como administrador
  * **E** existe um usuário ativo com perfil "Projetista"
  * **Quando** edito o usuário, altero o perfil para "Analista" e salvo
  * **Então** no próximo login dele o menu passa a ser o de análise e a ação fica no log de auditoria.

---

## US-04 — Assistente de projeto (6 passos)
**Como** projetista responsável por um empreendimento  
**Eu quero** cadastrar os dados do projeto, unidades e cargas em um assistente guiado que salva rascunhos  
**Para que** eu monte o memorial de cargas de uma só vez, sem perder o trabalho caso precise parar no meio.

* **Cenário 1: Rascunho é criado ao concluir o passo 1**
  * **Dado** que preenchi todos os campos obrigatórios de "Dados do Projeto"
  * **Quando** clico em "Continuar"
  * **Então** avanço para "Unidades Consumidoras" e o projeto aparece em "Meus Projetos" com status Rascunho.

* **Cenário 2: Retomar rascunho no passo em que parei**
  * **Dado** que tenho um rascunho salvo no passo 3 (Cargas de Serviço)
  * **Quando** abro esse projeto na lista e clico em "Continuar edição"
  * **Então** o assistente abre diretamente no passo correspondente com os dados preenchidos.

---

## US-05 — Cálculo de demanda e enquadramento
**Como** projetista que hoje calcula a demanda em planilha  
**Eu quero** ver a demanda total e o enquadramento (BT/MT) calculados pelo sistema baseados na norma vigente  
**Para que** eu tenha certeza do enquadramento antes de enviar o projeto e possa defender o número.

* **Cenário 1: Enquadramento em Baixa Tensão**
  * **Dado** que meu projeto tem demanda calculada de 68,4 kW
  * **Quando** o cálculo é concluído no passo 4
  * **Então** vejo a etiqueta "Baixa Tensão" e a subestação não é exigida.

* **Cenário 2: Enquadramento em Média Tensão**
  * **Dado** que meu projeto tem demanda calculada de 82,1 kW
  * **Quando** o cálculo é concluído
  * **Então** vejo a etiqueta "Média Tensão" e o bloco "Dimensionamento da Subestação" torna-se obrigatório.

---

## US-06 — Análise e parecer técnico
**Como** analista técnico da Neoenergia (e como projetista que enviou o projeto)  
**Eu quero** receber/emitir um parecer de aprovação ou reprovação com motivo registrado  
**Para que** exista uma decisão técnica rastreável, com data, autor e justificativa.

* **Cenário 1: Aprovar o projeto**
  * **Dado** que estou analisando um projeto com status "Em análise"
  * **Quando** clico em "APROVAR PROJETO" e confirmo
  * **Então** o projeto passa a "Aprovado", o atestado é emitido e o histórico registra o evento.

* **Cenário 2: Reprovar exige motivo**
  * **Dado** que estou no modal "Confirmar Reprovação"
  * **E** não selecionei nenhum motivo
  * **Quando** tento confirmar
  * **Então** o botão permanece desabilitado com a mensagem "Selecione um motivo."

---

## US-07 — Atestado digital e validação
**Como** consumidor, construtora, prefeitura ou cartório  
**Eu quero** conferir a autenticidade do atestado de projeto escaneando o QR Code ou digitando o código  
**Para que** eu confie no documento sem precisar telefonar para a Neoenergia.

* **Cenário 1: Validar por código digitado**
  * **Dado** que sou um terceiro sem login na página pública de validação
  * **E** tenho em mãos um atestado impresso
  * **Quando** digito o identificador e clico em "Validar"
  * **Então** vejo "Atestado válido" com a data de emissão, responsável técnico e norma.

* **Cenário 2: Validar por QR Code**
  * **Dado** que tenho o atestado impresso em mãos
  * **Quando** escaneio o QR Code com a câmera do celular e abro o link
  * **Então** a página de validação abre já com o resultado positivo exibido na tela.
 
  * * **Documento com as Histórias de Usuário: https://miro.com/app/board/uXjVHyQVgWE=/** 
 
* **Artefatos de Planejamento (Stakeholders):** O planejamento incluiu o mapeamento de engajamento da matriz de stakeholders (Sponsor Executivo, Product Manager, Engenharia/DevOps, UX/Research, Times Piloto, Segurança/Compliance e Suporte/CS).
* **Protótipo Lo-Fi (Figma):** [🎨 Acessar Protótipo no Figma](https://www.figma.com/design/MYT7u40LX8F6TngwXPeniZ/Sem-t%C3%ADtulo?node-id=0-1&t=r8Gwz42SnUNSLBvr-1)
  * O protótipo contempla as jornadas descritas no backlog (cobrindo no mínimo 5 histórias).

* **Screencast de Apresentação:** [▶️ Assistir no YouTube](https://youtu.be/2EkI06RKYJc)
  * Vídeo demonstrando a navegação no protótipo Figma, com a explicação de cada história implementada.

### Entrega 02: Implementação Inicial *(Em Breve)*
*(Links e artefatos serão adicionados nesta seção durante a respectiva sprint)*

---

## ⚙️ Como rodar o projeto
*(Esta seção será preenchida a partir da Entrega 02, detalhando passos de instalação, scripts do Docker e variáveis de ambiente)*

1. Clone o repositório: `git clone https://github.com/FelipeUCAA/Projeto_NeoEnergia_CesarSchool.git`
2. *(Em breve: comandos do docker-compose e execução do Front/Back)*

---

