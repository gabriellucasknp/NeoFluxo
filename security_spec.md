# Especificação de Segurança Firestore (ABAC & Zero-Trust) — NeoFluxo

## 1. Invariantes de Dados
1. **Identidade do Proprietário**: Somente o próprio projetista (`request.auth.uid == resource.data.projetistaId`) ou um administrador pode editar rascunhos de seus projetos.
2. **Proibição de Auto-Escalação de Privilégios**: Um usuário comum nunca pode alterar seu próprio atributo `role` para `admin` ou `analista`, nem criar documentos na coleção restrita `/admins/`.
3. **Máquina de Estados de Análise**:
   - Somente Analistas ou Administradores podem alterar o status de um projeto para `em_analise`, `aprovado` ou `reprovado`.
   - Projetistas só podem transitar status de `rascunho` para `enviado_analise` ou reenvio após reprovação.
4. **Justificativa Obrigatória na Reprovação**: A reprovação de um projeto exige obrigatoriamente preenchimento de `rejectionReason` e `rejectionObservations`.
5. **Imutabilidade de Atestados Emitidos**: Uma vez emitido um atestado na coleção `/certificates/`, ele se torna imutável e somente leitura pública para fins de validação cadastral e de QR Code.
6. **Catálogos Oficiais da Concessionária**: As coleções `/transformers` e `/demandFactors` são de leitura para todos os usuários autenticados, mas de escrita restrita exclusiva a administradores.

## 2. As 12 Cargas Hostis ("Dirty Dozen" Payloads)
1. **Payload 1 (Self-Role-Elevation)**: Projetista tenta atualizar seu próprio documento `/users/{uid}` com `role: "admin"`. Esperado: `PERMISSION_DENIED`.
2. **Payload 2 (Orphan Admin Insertion)**: Usuário comum tenta criar um registro em `/admins/{uid}`. Esperado: `PERMISSION_DENIED`.
3. **Payload 3 (Project Hijacking)**: Projetista A tenta atualizar ou excluir projeto criado pelo Projetista B. Esperado: `PERMISSION_DENIED`.
4. **Payload 4 (Direct Self-Approval)**: Projetista tenta submeter atualização de status diretamente para `aprovado`. Esperado: `PERMISSION_DENIED`.
5. **Payload 5 (Unauthenticated Write)**: Requisição anônima sem token tenta salvar projeto. Esperado: `PERMISSION_DENIED`.
6. **Payload 6 (Oversized ID Poisoning)**: Documento enviado com ID maior que 128 caracteres ou caracteres ilegais. Esperado: `PERMISSION_DENIED`.
7. **Payload 7 (Shadow Fields Injection)**: Escrita em projeto contendo campos arbitrários não permitidos (`{ isAdminBackdoor: true }`). Esperado: `PERMISSION_DENIED`.
8. **Payload 8 (Certificate Forgery)**: Projetista comum tenta criar registro diretamente em `/certificates/`. Esperado: `PERMISSION_DENIED`.
9. **Payload 9 (Rejection without Justification)**: Analista tenta reprovar projeto sem fornecer `rejectionReason`. Esperado: `PERMISSION_DENIED`.
10. **Payload 10 (Terminal State Alteration)**: Tentativa de modificar dados de carga de um projeto que já atingiu status `aprovado`. Esperado: `PERMISSION_DENIED`.
11. **Payload 11 (Catalog Tampering)**: Projetista tenta alterar fatores de demanda normativos em `/demandFactors/df1`. Esperado: `PERMISSION_DENIED`.
12. **Payload 12 (Blanket User Scrape)**: Usuário comum tenta listar dados sensíveis de todos os outros usuários sem filtro. Esperado: `PERMISSION_DENIED`.
