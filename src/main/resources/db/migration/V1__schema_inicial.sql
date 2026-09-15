-- Flyway V1: Schema inicial do NeoFluxo

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('projetista', 'analista', 'admin') NOT NULL,
    department VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE norm_versions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    norma VARCHAR(50) NOT NULL,
    version VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    responsible VARCHAR(255),
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE demand_factors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    label VARCHAR(255) NOT NULL,
    min_power DOUBLE NOT NULL DEFAULT 0,
    max_power DOUBLE NOT NULL DEFAULT 0,
    factor DOUBLE NOT NULL DEFAULT 1.0,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE transformers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    power_kva DOUBLE NOT NULL,
    voltage VARCHAR(50),
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    status ENUM('rascunho', 'enviado_analise', 'em_analise', 'aprovado', 'reprovado') NOT NULL DEFAULT 'rascunho',

    -- Dados do projeto
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    address_number VARCHAR(20),
    complement VARCHAR(100),
    neighborhood VARCHAR(100),
    city VARCHAR(100),
    cep VARCHAR(20),
    document VARCHAR(30),
    art_number VARCHAR(50),
    technical_responsible VARCHAR(255),
    observations TEXT,
    norma_version VARCHAR(20),

    -- Resultado do calculo
    total_installed_power DOUBLE,
    calculated_demand DOUBLE,
    unit_count INT,
    unit_demand DOUBLE,
    service_demand DOUBLE,
    enquadramento ENUM('baixa_tensao', 'media_tensao'),
    norma_aplicada VARCHAR(50),
    needs_substation BOOLEAN DEFAULT FALSE,

    -- Subestacao (se media tensao)
    transformador_id BIGINT,
    subestacao_quantidade INT,
    subestacao_configuracao VARCHAR(255),
    subestacao_observacoes TEXT,

    -- Rejeicao
    rejection_reason VARCHAR(255),
    rejection_observations TEXT,
    rejection_analyst VARCHAR(255),
    rejection_date TIMESTAMP,

    -- Relacoes
    projetista_id BIGINT NOT NULL,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP NULL,
    analyzed_at TIMESTAMP NULL,
    approved_at TIMESTAMP NULL,

    FOREIGN KEY (projetista_id) REFERENCES users(id),
    FOREIGN KEY (transformador_id) REFERENCES transformers(id)
);

CREATE TABLE consumer_unit_groups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    unit_type VARCHAR(100),
    unit_count INT NOT NULL DEFAULT 1,
    tug_count INT DEFAULT 0,
    tue_count INT DEFAULT 0,
    lighting_points INT DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE unit_loads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    consumer_unit_group_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    label VARCHAR(255),
    quantity INT NOT NULL DEFAULT 1,
    power_per_unit DOUBLE NOT NULL,
    FOREIGN KEY (consumer_unit_group_id) REFERENCES consumer_unit_groups(id) ON DELETE CASCADE
);

CREATE TABLE service_loads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    category VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    power DOUBLE NOT NULL,
    motor_type VARCHAR(50),
    current_amperes DOUBLE,
    start_type VARCHAR(50),
    notes TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE certificates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    project_id BIGINT NOT NULL,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unique_identifier VARCHAR(100) NOT NULL UNIQUE,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE project_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    action VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    detail TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE system_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    entity VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
