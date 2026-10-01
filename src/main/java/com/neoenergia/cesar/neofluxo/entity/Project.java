package com.neoenergia.cesar.neofluxo.entity;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "projects")
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 40)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "projetista_id")
    private User projetista;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(nullable = false)
    private Integer currentStep;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private JsonNode data;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private JsonNode units;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private JsonNode serviceLoads;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private JsonNode calcResult;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private JsonNode subestacao;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private JsonNode review;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private JsonNode rejection;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private JsonNode history;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private JsonNode certificate;

    private Instant analyzedAt;

    private Instant approvedAt;

    @Column(unique = true, length = 40)
    private String certificateCode;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    private Instant submittedAt;

    public Project() {
    }

    public Project(UUID id, String code, User projetista, Status status, Integer currentStep,
                   JsonNode data, JsonNode units, JsonNode serviceLoads, JsonNode calcResult,
                   JsonNode subestacao, JsonNode review, JsonNode rejection, JsonNode history, JsonNode certificate,
                   Instant createdAt, Instant updatedAt, Instant submittedAt, Instant analyzedAt, Instant approvedAt) {
        this.id = id;
        this.code = code;
        this.projetista = projetista;
        this.status = status;
        this.currentStep = currentStep;
        this.data = data;
        this.units = units;
        this.serviceLoads = serviceLoads;
        this.calcResult = calcResult;
        this.subestacao = subestacao;
        this.review = review;
        this.rejection = rejection;
        this.history = history;
        this.certificate = certificate;
        this.analyzedAt = analyzedAt;
        this.approvedAt = approvedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.submittedAt = submittedAt;
    }

    @PrePersist
    void create() {
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = createdAt;
        if (status == null) status = Status.RASCUNHO;
        if (currentStep == null) currentStep = 1;
        if (history == null) history = com.fasterxml.jackson.databind.node.JsonNodeFactory.instance.arrayNode();
    }

    @PreUpdate
    void update() {
        updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public User getProjetista() { return projetista; }
    public void setProjetista(User projetista) { this.projetista = projetista; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public Integer getCurrentStep() { return currentStep; }
    public void setCurrentStep(Integer currentStep) { this.currentStep = currentStep; }
    public JsonNode getData() { return data; }
    public void setData(JsonNode data) { this.data = data; }
    public JsonNode getUnits() { return units; }
    public void setUnits(JsonNode units) { this.units = units; }
    public JsonNode getServiceLoads() { return serviceLoads; }
    public void setServiceLoads(JsonNode serviceLoads) { this.serviceLoads = serviceLoads; }
    public JsonNode getCalcResult() { return calcResult; }
    public void setCalcResult(JsonNode calcResult) { this.calcResult = calcResult; }
    public JsonNode getSubestacao() { return subestacao; }
    public void setSubestacao(JsonNode subestacao) { this.subestacao = subestacao; }
    public JsonNode getReview() { return review; }
    public void setReview(JsonNode review) { this.review = review; }
    public JsonNode getRejection() { return rejection; }
    public void setRejection(JsonNode rejection) { this.rejection = rejection; }
    public JsonNode getHistory() { return history; }
    public void setHistory(JsonNode history) { this.history = history; }
    public JsonNode getCertificate() { return certificate; }
    public void setCertificate(JsonNode certificate) { this.certificate = certificate; }
    public Instant getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(Instant analyzedAt) { this.analyzedAt = analyzedAt; }
    public Instant getApprovedAt() { return approvedAt; }
    public void setApprovedAt(Instant approvedAt) { this.approvedAt = approvedAt; }
    public String getCertificateCode() { return certificateCode; }
    public void setCertificateCode(String certificateCode) { this.certificateCode = certificateCode; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }

    public enum Status { RASCUNHO, ENVIADO_ANALISE, EM_ANALISE, APROVADO, REPROVADO }
}
