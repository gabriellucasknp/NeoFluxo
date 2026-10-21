# Roteiro de Demonstração (Screencast) — Backend com Java e Spring Boot
**Projeto:** NeoFluxo — Portal de Projetos Elétricos (Neoenergia Pernambuco)  
**Tempo estimado de gravação:** 5 a 8 minutos  
**Idioma:** Português (Brasil)  

---

## 1. Visão Geral da Arquitetura Encontrada

- **Linguagem & Framework:** Java 21 LTS com Spring Boot 4.x / Spring Framework 6.
- **Módulos Principais do Spring:**
  - `spring-boot-starter-web`: Exposição de APIs RESTful estruturadas.
  - `spring-boot-starter-data-jpa`: Camada ORM com Hibernate e repositories declarativos.
  - `spring-boot-starter-security`: Spring Security 6 com autenticação stateless via JWT e criptografia de senhas com BCrypt.
  - `spring-boot-starter-validation`: Bean Validation para validação de DTOs e integridade de dados.
  - `flyway-mysql`: Controle de versão de migrações DDL para banco de dados relacional.
  - `mysql-connector-j`: Driver JDBC para MySQL 8.0 em contêiner Docker (`neofluxo-mysql`).
  - `h2`: Banco de dados em memória configurado para execução ágil de testes automatizados (`@SpringBootTest`).

---

## 2. O Que Já Existia Antes das Alterações

1. **Estrutura básica do projeto Spring Boot:**
   - Mapeamento inicial das entidades `User` e `Project`.
   - Rotas parciais em `ProjectController`, `AuthController` e `CalculationController`.
   - `CalculationService` com tabelas básicas de fatores de demanda de iluminação, tomadas (TUG/TUE) e condomínio.
   - Configuração de segurança stateless com filtro JWT (`JwtFilter`, `JwtService`).
   - Sementes de dados (`DataInitializer`) com três perfis de teste pré-cadastrados (Carlos Mendes/Projetista, Ana Silva/Analista, Roberto Fonseca/Admin).
   - Suíte de testes com métodos vazios (`NeofluxoApplicationTests` com placeholders comentados).

---

## 3. Funcionalidades que Estavam Ausentes ou Incompletas

1. **Entrega 01 — Assistente de 6 Passos (US-04):**
   - Faltavam endpoints explícitos para salvamento de rascunhos com recuperação de memória de cálculo (`/projects/{id}/draft`, `/projects/{id}/calculate`, `/projects/{id}/calculation-memory`).
   - Faltava o endpoint de emissão direta de atestados técnicos (`/projects/{id}/emit-atestado`), exigido pelo fluxo de tela do projetista.
   - Faltava validação detalhada de etapas inválidas e tratamento de integridade nos passos intermediários.

2. **Entrega 03 — Login com Credenciais Neoenergia (US-01):**
   - Não havia camada formal representando o gateway de integração com o provedor corporativo de identidade da Neoenergia (`@neoenergia.com`).
   - Não havia separação clara entre autenticação externa/SSO e o fallback seguro para banco local criptografado.
   - Faltava endpoint de diagnóstico de status do provedor corporativo (`GET /auth/corporate/status`).

3. **Entrega — Análise e Parecer Técnico (US-06):**
   - **Ausência de entidade relacional dedicada:** O parecer técnico ficava apenas como um nó JSON no projeto, sem entidade JPA própria para auditoria formal.
   - Não havia histórico persistido de pareceres anteriores quando um projeto era reprovado e reenviado para reanálise.
   - Faltava endpoint para consultar o histórico cronológico de análises técnicas (`GET /projects/{id}/reviews`).
   - Faltava suporte a justificativa técnica customizada na aprovação (`ProjectApproveRequest`).

4. **Entrega — Cálculo de Demanda e Enquadramento (US-05):**
   - Faltava validação de valores de entrada (rejeitar potências ou quantidades negativas).
   - Faltava método para calcular a demanda diretamente a partir da entidade `Project` salva no banco e atualizar seu `calcResult`.
   - Faltava endpoint público de regras normativas (`GET /calc/rules`).

5. **Testes Automatizados:**
   - Havia 4 métodos vazios e nenhum teste cobrindo cálculos, regras normativas (DIS-NOR-030 e DIS-NOR-053), ciclo de vida de projetos e segurança.

---

## 4. Arquivos Criados ou Modificados

| Arquivo | Tipo | Motivo da Alteração |
| :--- | :--- | :--- |
| `src/main/java/.../entity/TechnicalReview.java` | Criado | Entidade JPA para registro auditável de pareceres técnicos (aprovação/reprovação). |
| `src/main/java/.../repository/TechnicalReviewRepository.java` | Criado | Repository Spring Data JPA para consultas do histórico de pareceres por projeto e por analista. |
| `src/main/java/.../dto/ProjectApproveRequest.java` | Criado | DTO para receber justificativa e observações técnicas na aprovação. |
| `src/main/java/.../dto/TechnicalReviewResponse.java` | Criado | DTO para devolver o histórico auditável de pareceres técnicos. |
| `src/main/java/.../service/NeoenergiaCorporateAuthService.java` | Criado | Serviço de autenticação corporativa Neoenergia, validação de domínio `@neoenergia.com` e gateway para SSO. |
| `src/main/resources/db/migration/V1__init_schema.sql` | Criado | Script Flyway versionado para criação das tabelas `users`, `projects` e `technical_reviews`. |
| `src/test/resources/application.properties` | Criado | Configuração de banco em memória H2 para testes automatizados rápidos e isolados. |
| `src/test/java/.../service/CalculationServiceTest.java` | Criado | 4 testes cobrindo BT, MT, limite regulatório de 75 kW e validação de potência negativa. |
| `src/test/java/.../service/ProjectServiceTest.java` | Criado | 5 testes cobrindo assistente de 6 passos, submissão, aprovação, reprovação e controle de acesso. |
| `src/test/java/.../service/AuthServiceTest.java` | Criado | 4 testes cobrindo login corporativo, senhas incorretas, contas inativas e validação de domínio. |
| `src/test/java/.../NeofluxoApplicationTests.java` | Modificado | Implementação das asserções reais dos 5 métodos de teste da aplicação. |
| `src/main/java/.../entity/Project.java` | Modificado | Relacionamento `@OneToMany` com `TechnicalReview`. |
| `src/main/java/.../dto/ProjectResponse.java` | Modificado | Inclusão de `certificateCode` para expor o código oficial do atestado emitido. |
| `src/main/java/.../service/CalculationService.java` | Modificado | Validação de cargas, método `calculateForProject` e regras normativas da concessionária. |
| `src/main/java/.../service/ProjectService.java` | Modificado | Persistência de `TechnicalReview`, cálculo integrado, emissão direta de atestado e consulta de pareceres. |
| `src/main/java/.../service/AuthService.java` | Modificado | Integração com `NeoenergiaCorporateAuthService` e mascaramento seguro de credenciais nos logs. |
| `src/main/java/.../controller/ProjectController.java` | Modificado | Endpoints `/steps/{step}`, `/draft`, `/calculate`, `/calculation-memory`, `/reviews`, `/emit-atestado`. |
| `src/main/java/.../controller/CalculationController.java` | Modificado | Endpoint `/calc/rules` com limites e normas da concessionária. |
| `src/main/java/.../controller/AuthController.java` | Modificado | Endpoint `/auth/corporate/status` informando estado da integração corporativa. |
| `src/main/java/.../config/SecurityConfig.java` | Modificado | Liberação pública de `/calc/rules` e `/certificates/validate/**`. |
| `src/main/java/.../exception/ApiExceptionHandler.java` | Modificado | Tratamento de `MethodArgumentNotValidException`, `AccessDeniedException` e padronização JSON. |
| `pom.xml` | Modificado | Adição da dependência `h2` com escopo de teste. |

---

## 5. Roteiro Passo a Passo para o Screencast (5 a 8 Minutos)

### Bloco 1: Abertura e Apresentação da Arquitetura (1 minuto)
- **O que mostrar:** Terminal ou IDE com a árvore de diretórios do projeto (`src/main/java/com/neoenergia/cesar/neofluxo/`).
- **Fala sugerida:**
  > *"Olá! Neste vídeo apresento a auditoria e implementação do backend em Java com Spring Boot do sistema NeoFluxo, desenvolvido para o Portal de Projetos Elétricos da Neoenergia Pernambuco. Nosso foco foi implementar e validar com testes as quatro entregas essenciais: o Assistente de Projetos de 6 passos (US-04), a Autenticação Corporativa (US-01), a Análise e Parecer Técnico rastreável (US-06), e o Cálculo Automatizado de Demanda e Enquadramento segundo as normas DIS-NOR-030 e DIS-NOR-053 (US-05)."*

### Bloco 2: Entrega 03 — Autenticação Corporativa Neoenergia (US-01) (1 minuto e meio)
- **O que mostrar:** Abrir `NeoenergiaCorporateAuthService.java` e `AuthController.java`.
- **Comando no terminal:**
  ```bash
  curl -X POST http://localhost:8080/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"carlos.mendes@neoenergia.com","password":"demo123"}'
  ```
- **Fala sugerida:**
  > *"Aqui no módulo de autenticação, criamos o `NeoenergiaCorporateAuthService`. Ele valida os domínios corporativos permitidos, como `@neoenergia.com`, e define a arquitetura para plugar o Single Sign-On corporativo sem expor credenciais em logs ou código. Enquanto as credenciais de produção do servidor da Neoenergia não estão injetadas no ambiente, o sistema autentica de forma segura via BCrypt com tokens JWT assinados de 24 horas. Rotas privadas são protegidas e contas inativas são rejeitadas com erro 401."*

### Bloco 3: Entrega 01 — Assistente de Projeto de 6 Passos e Rascunhos (US-04) (1 minuto e meio)
- **O que mostrar:** Abrir `ProjectController.java` e `ProjectService.java`.
- **Comandos no terminal (criar rascunho e avançar passo):**
  ```bash
  # 1. Criação do rascunho
  curl -X POST http://localhost:8080/projects \
    -H "Authorization: Bearer <TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"name":"Edifício Solar Boa Viagem","city":"Recife"}'

  # 2. Salvamento do Passo 2 (Unidades)
  curl -X PUT http://localhost:8080/projects/<ID>/steps/2 \
    -H "Authorization: Bearer <TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"step":2,"units":[{"name":"Aptos","unitCount":10,"loads":[{"type":"iluminacao","quantity":10,"powerPerUnit":100}]}]}'
  ```
- **Fala sugerida:**
  > *"O assistente de 6 passos permite que o projetista inicie o cadastro, salve rascunhos em qualquer uma das etapas e retome o trabalho a qualquer momento sem perder o memorial. Cada etapa atualiza o estado persistido no banco relacional, garantindo que mesmo reiniciando a aplicação os dados continuam intactos. Implementamos também o endpoint `/emit-atestado` para geração imediata do documento técnico oficial."*

### Bloco 4: Entrega 05 — Cálculo de Demanda e Enquadramento (US-05) (1 minuto e meio)
- **O que mostrar:** Abrir `CalculationService.java`.
- **Comando no terminal:**
  ```bash
  curl -X POST http://localhost:8080/calc/demand \
    -H "Content-Type: application/json" \
    -d '{
      "units": [{"name":"Residencial","unitCount":1,"loads":[{"type":"tug","quantity":10,"powerPerUnit":200}]}],
      "serviceLoads": []
    }'
  ```
- **Fala sugerida:**
  > *"No `CalculationService`, implementamos as regras exatas da concessionária: até 75 kW a instalação é classificada em Baixa Tensão pela norma DIS-NOR-030. Acima de 75 kW, o enquadramento passa automaticamente para Média Tensão conforme a norma DIS-NOR-053, indicando a necessidade de subestação e sugerindo a potência nominal de transformador padronizado (como 112.5, 150 ou 225 kVA). O serviço gera uma memória de cálculo detalhada item a item para conferência e auditoria."*

### Bloco 5: Entrega 06 — Análise Técnica, Aprovação e Pareceres (US-06) (1 minuto)
- **O que mostrar:** Abrir `TechnicalReview.java` e `ProjectService.java` (métodos `approve`, `reject`, `getReviews`).
- **Comandos no terminal:**
  ```bash
  # Submissão
  curl -X POST http://localhost:8080/projects/<ID>/submit \
    -H "Authorization: Bearer <TOKEN_PROJETISTA>"

  # Aprovação com Parecer Técnico Favorável
  curl -X POST http://localhost:8080/projects/<ID>/approve \
    -H "Authorization: Bearer <TOKEN_ANALISTA>" \
    -H "Content-Type: application/json" \
    -d '{"justification":"Memorial em conformidade com a DIS-NOR-030"}'
  ```
- **Fala sugerida:**
  > *"Para a rastreabilidade da decisão técnica, criamos a entidade `TechnicalReview`. Quando um analista aprova ou reprova o projeto, o sistema exige justificativa fundamentada, vincula o analista responsável, grava data/hora e preserva todo o histórico de revisões. Projetistas não têm permissão para aprovar projetos, garantindo segregação de funções. Na aprovação, um atestado digital único com identificador global e link de validação pública é gerado."*

### Bloco 6: Execução dos Testes e Encerramento (1 minuto)
- **O que mostrar:** Execução no terminal:
  ```bash
  mvn test
  ```
- **Resultado na tela:**
  ```text
  [INFO] Tests run: 18, Failures: 0, Errors: 0, Skipped: 0
  [INFO] BUILD SUCCESS
  ```
- **Fala sugerida:**
  > *"Para garantir que tudo funcione com excelência, executamos a suíte de 18 testes automatizados abrangendo casos de sucesso, cenários de borda (como o limite de 75 kW), rejeição de entradas inválidas, persistência de pareceres e controle de acesso. Todos os 18 testes passaram com 100% de sucesso. Muito obrigado!"*

---

## 6. Comandos para Executar e Validar o Projeto

### Compilação do Backend
```bash
mvn clean compile
```

### Execução da Suíte Completa de Testes
```bash
mvn test
```

### Empacotamento do Jar Executável
```bash
mvn package -DskipTests
# O arquivo gerado estará em: target/neofluxo-0.0.1-SNAPSHOT.jar
```

### Execução em Desenvolvimento Local
```bash
java -jar target/neofluxo-0.0.1-SNAPSHOT.jar
```

### Execução via Docker Compose (Com MySQL 8)
```bash
docker-compose up --build
```
