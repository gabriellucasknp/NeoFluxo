package com.neoenergia.cesar.neofluxo.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.neoenergia.cesar.neofluxo.entity.Project;
import com.neoenergia.cesar.neofluxo.entity.User;
import com.neoenergia.cesar.neofluxo.repository.ProjectRepository;
import com.neoenergia.cesar.neofluxo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.UUID;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seed(UserRepository userRepository, ProjectRepository projectRepository, PasswordEncoder encoder, ObjectMapper mapper) {
        return args -> {
            User projetista = userRepository.findByEmailIgnoreCase("carlos.mendes@neoenergia.com").orElseGet(() -> {
                User u = new User();
                u.setName("Carlos Mendes");
                u.setEmail("carlos.mendes@neoenergia.com");
                u.setPasswordHash(encoder.encode("demo123"));
                u.setRole(User.Role.PROJETISTA);
                u.setDepartment("Projetos Elétricos");
                u.setActive(true);
                return userRepository.save(u);
            });

            User analista = userRepository.findByEmailIgnoreCase("ana.silva@neoenergia.com").orElseGet(() -> {
                User u = new User();
                u.setName("Ana Beatriz Silva");
                u.setEmail("ana.silva@neoenergia.com");
                u.setPasswordHash(encoder.encode("demo123"));
                u.setRole(User.Role.ANALISTA);
                u.setDepartment("Análise Técnica");
                u.setActive(true);
                return userRepository.save(u);
            });

            User admin = userRepository.findByEmailIgnoreCase("roberto.fonseca@neoenergia.com").orElseGet(() -> {
                User u = new User();
                u.setName("Roberto Fonseca");
                u.setEmail("roberto.fonseca@neoenergia.com");
                u.setPasswordHash(encoder.encode("demo123"));
                u.setRole(User.Role.ADMIN);
                u.setDepartment("Engenharia");
                u.setActive(true);
                return userRepository.save(u);
            });

            if (userRepository.findByEmailIgnoreCase("admin@example.com").isEmpty()) {
                User adminDefault = new User();
                adminDefault.setName("Administrador");
                adminDefault.setEmail("admin@example.com");
                adminDefault.setPasswordHash(encoder.encode("Admin@123"));
                adminDefault.setRole(User.Role.ADMIN);
                adminDefault.setDepartment("Governança e TI");
                adminDefault.setActive(true);
                userRepository.save(adminDefault);
            }

            // Seed demo projects if none exist
            if (projectRepository.count() == 0) {
                // 1. Rascunho BT (US-04)
                Project p1 = new Project();
                p1.setCode("PE-2024-001");
                p1.setProjetista(projetista);
                p1.setStatus(Project.Status.RASCUNHO);
                p1.setCurrentStep(2);
                ObjectNode d1 = mapper.createObjectNode();
                d1.put("name", "Residencial Boa Viagem");
                d1.put("address", "Av. Boa Viagem");
                d1.put("number", "1250");
                d1.put("neighborhood", "Boa Viagem");
                d1.put("city", "Recife");
                d1.put("cep", "51020-000");
                d1.put("document", "12.345.678/0001-90");
                d1.put("artNumber", "PE2024018293");
                d1.put("technicalResponsible", "Carlos Mendes — Eng. Eletricista");
                p1.setData(d1);
                projectRepository.save(p1);

                // 2. Enviado para análise MT (US-05 & US-06)
                Project p2 = new Project();
                p2.setCode("PE-2024-002");
                p2.setProjetista(projetista);
                p2.setStatus(Project.Status.ENVIADO_ANALISE);
                p2.setCurrentStep(6);
                p2.setSubmittedAt(Instant.now());
                ObjectNode d2 = mapper.createObjectNode();
                d2.put("name", "Empresarial RioMar Trade Center");
                d2.put("address", "Av. República do Líbano");
                d2.put("number", "251");
                d2.put("neighborhood", "Pina");
                d2.put("city", "Recife");
                d2.put("cep", "51110-160");
                d2.put("document", "98.765.432/0001-11");
                d2.put("artNumber", "PE2024099412");
                d2.put("technicalResponsible", "Carlos Mendes — Eng. Eletricista");
                p2.setData(d2);

                ObjectNode c2 = mapper.createObjectNode();
                c2.put("totalInstalledPower", 280.5);
                c2.put("calculatedDemand", 168.4);
                c2.put("enquadramento", "media_tensao");
                c2.put("needsSubstation", true);
                c2.put("normaAplicada", "DIS-NOR-053");
                p2.setCalcResult(c2);

                ObjectNode s2 = mapper.createObjectNode();
                s2.put("transformadorId", "t3");
                s2.put("transformadorLabel", "Transformador Padronizado 225 kVA");
                s2.put("potenciaNominal", 225);
                s2.put("quantidade", 1);
                s2.put("configuracao", "Subestação abrigada em alvenaria 13.8kV/380V");
                p2.setSubestacao(s2);
                projectRepository.save(p2);

                // 3. Aprovado BT com Atestado Digital (US-06)
                Project p3 = new Project();
                p3.setCode("PE-2024-003");
                p3.setProjetista(projetista);
                p3.setStatus(Project.Status.APROVADO);
                p3.setCurrentStep(6);
                p3.setSubmittedAt(Instant.now().minusSeconds(86400 * 3));
                p3.setAnalyzedAt(Instant.now().minusSeconds(86400));
                p3.setApprovedAt(Instant.now().minusSeconds(86400));
                p3.setCertificateCode("AT-2024-0003");

                ObjectNode d3 = mapper.createObjectNode();
                d3.put("name", "Condomínio Solar das Palmeiras");
                d3.put("address", "Rua das Graças");
                d3.put("number", "450");
                d3.put("neighborhood", "Graças");
                d3.put("city", "Recife");
                d3.put("cep", "52011-000");
                d3.put("document", "45.123.890/0001-34");
                d3.put("artNumber", "PE2024033211");
                d3.put("technicalResponsible", "Carlos Mendes — Eng. Eletricista");
                p3.setData(d3);

                ObjectNode c3 = mapper.createObjectNode();
                c3.put("totalInstalledPower", 68.0);
                c3.put("calculatedDemand", 42.5);
                c3.put("enquadramento", "baixa_tensao");
                c3.put("needsSubstation", false);
                c3.put("normaAplicada", "DIS-NOR-030");
                p3.setCalcResult(c3);

                ObjectNode cert3 = mapper.createObjectNode();
                cert3.put("id", UUID.randomUUID().toString());
                cert3.put("code", "AT-2024-0003");
                cert3.put("projectId", "p3");
                cert3.put("projectCode", "PE-2024-003");
                cert3.put("issueDate", Instant.now().minusSeconds(86400).toString());
                cert3.put("uniqueIdentifier", "NEO-AT-2024-8F7E6D5C4B3A");
                cert3.put("analystId", analista.getId().toString());
                cert3.put("analystName", analista.getName());
                cert3.put("validationUrl", "/api/certificates/validate/AT-2024-0003");
                cert3.put("qrCodeData", "/api/certificates/validate/AT-2024-0003");
                p3.setCertificate(cert3);
                projectRepository.save(p3);

                // 4. Reprovado com Parecer Técnico (US-06)
                Project p4 = new Project();
                p4.setCode("PE-2024-004");
                p4.setProjetista(projetista);
                p4.setStatus(Project.Status.REPROVADO);
                p4.setCurrentStep(4);
                p4.setSubmittedAt(Instant.now().minusSeconds(86400 * 2));
                p4.setAnalyzedAt(Instant.now().minusSeconds(3600 * 12));

                ObjectNode d4 = mapper.createObjectNode();
                d4.put("name", "Galpão Logístico Suape");
                d4.put("address", "Rodovia PE-060");
                d4.put("number", "KM 12");
                d4.put("neighborhood", "Distrito Industrial");
                d4.put("city", "Ipojuca");
                d4.put("cep", "55590-000");
                d4.put("document", "33.222.111/0001-44");
                d4.put("artNumber", "PE2024077889");
                d4.put("technicalResponsible", "Carlos Mendes — Eng. Eletricista");
                p4.setData(d4);

                ObjectNode rej4 = mapper.createObjectNode();
                rej4.put("reason", "Subdimensionamento de cargas de climatização / TUE");
                rej4.put("observations", "Memorial não considerou fatores de demanda para os aparelhos de ar condicionado central das docas.");
                rej4.put("analyst", analista.getName());
                rej4.put("analystId", analista.getId().toString());
                rej4.put("date", Instant.now().minusSeconds(3600 * 12).toString());
                p4.setRejection(rej4);
                projectRepository.save(p4);
            }
        };
    }
}
