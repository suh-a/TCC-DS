-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS tcc_ds_db;
USE tcc_ds_db;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    tipo_plano VARCHAR(50) NOT NULL DEFAULT 'gratis',
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de crianças
CREATE TABLE IF NOT EXISTS criancas (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    usuario_id BIGINT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    idade INT NOT NULL,
    foto_url VARCHAR(500),
    data_nascimento VARCHAR(20),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de planos
CREATE TABLE IF NOT EXISTS planos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    preco DOUBLE NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50) NOT NULL UNIQUE,
    limite_criancas INT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de relatórios
CREATE TABLE IF NOT EXISTS relatorios (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    crianca_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    tempo_jogado INT,
    acertos INT,
    erros INT,
    pontuacao INT,
    tipo_jogo VARCHAR(100),
    data_jogo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (crianca_id) REFERENCES criancas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Inserir planos iniciais
INSERT INTO planos (nome, preco, descricao, tipo, limite_criancas) VALUES
('Plano Gratuito', 0.00, 'Acesso limitado aos jogos educativos', 'gratis', 1),
('Plano Pro', 29.90, 'Acesso completo a todos os jogos e relatórios avançados', 'pro', 3),
('Plano Premium', 99.90, 'Acesso ilimitado com suporte prioritário e relatórios personalizados', 'premium', NULL);

-- Criar índices para melhor performance
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_criancas_usuario_id ON criancas(usuario_id);
CREATE INDEX idx_relatorios_crianca_id ON relatorios(crianca_id);
CREATE INDEX idx_relatorios_usuario_id ON relatorios(usuario_id);
CREATE INDEX idx_planos_tipo ON planos(tipo);
