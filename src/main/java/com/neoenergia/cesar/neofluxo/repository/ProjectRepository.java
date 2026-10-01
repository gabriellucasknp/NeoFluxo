package com.neoenergia.cesar.neofluxo.repository;

import com.neoenergia.cesar.neofluxo.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {
    List<Project> findByProjetistaIdOrderByUpdatedAtDesc(UUID projetistaId);

    boolean existsByCertificateCode(String code);
}
