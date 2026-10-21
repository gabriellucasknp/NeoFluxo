-- Flyway Migration V1: Initial Schema for NeoFluxo
-- Compatible with MySQL 8.0+

CREATE TABLE IF NOT EXISTS users (
    id BINARY(16) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    department VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id BINARY(16) NOT NULL PRIMARY KEY,
    code VARCHAR(40) NOT NULL UNIQUE,
    projetista_id BINARY(16) NOT NULL,
    status VARCHAR(50) NOT NULL,
    current_step INT NOT NULL DEFAULT 1,
    data JSON,
    units JSON,
    service_loads JSON,
    calc_result JSON,
    subestacao JSON,
    review JSON,
    rejection JSON,
    history JSON,
    certificate JSON,
    certificate_code VARCHAR(40) UNIQUE,
    analyzed_at TIMESTAMP NULL,
    approved_at TIMESTAMP NULL,
    submitted_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_projects_projetista FOREIGN KEY (projetista_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS technical_reviews (
    id BINARY(16) NOT NULL PRIMARY KEY,
    project_id BINARY(16) NOT NULL,
    analyst_id BINARY(16) NOT NULL,
    decision VARCHAR(20) NOT NULL,
    reason VARCHAR(1000) NOT NULL,
    observations VARCHAR(2000),
    certificate_code VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_analyst FOREIGN KEY (analyst_id) REFERENCES users (id)
);
