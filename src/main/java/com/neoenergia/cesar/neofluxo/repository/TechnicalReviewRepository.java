package com.neoenergia.cesar.neofluxo.repository;

import com.neoenergia.cesar.neofluxo.entity.TechnicalReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TechnicalReviewRepository extends JpaRepository<TechnicalReview, UUID> {
    List<TechnicalReview> findByProjectIdOrderByCreatedAtDesc(UUID projectId);
    List<TechnicalReview> findByAnalystIdOrderByCreatedAtDesc(UUID analystId);
}
