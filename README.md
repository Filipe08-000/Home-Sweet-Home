# Home-Sweet-Home
Meu site no estilo airbnb para a matéria de projeto integrador.

Para executar e abrir o site é necessário ter o xampp rondando na máquina em paralelo, com o banco de dados já feito e em uso, siga o código para criação do banco via mysql pelo xampp.


-- 1. Criação do Banco de Dados
-- (Se o banco airbnb_db2 já existir, este comando será ignorado)
CREATE DATABASE IF NOT EXISTS airbnb_db2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE airbnb_db2;

-- 2. Tabela de Usuários (usuarios)
-- Armazena Anfitriões e Locatários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabela de Imóveis (imoveis)
-- Armazena os anúncios
CREATE TABLE IF NOT EXISTS imoveis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dono_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    descricao TEXT, -- Coluna adicionada para a descrição completa
    preco_diaria DECIMAL(10, 2) NOT NULL,
    imagem VARCHAR(255) NOT NULL,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dono_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabela de Reservas (reservas)
-- Armazena as reservas e os dados de pagamento
CREATE TABLE IF NOT EXISTS reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    imovel_id INT NOT NULL,
    usuario_id INT NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    dias INT NOT NULL, -- Coluna adicionada para armazenar o número de dias
    valor_total DECIMAL(10, 2) NOT NULL,
    metodo_pagamento VARCHAR(50) NOT NULL, -- Coluna adicionada (cartao, pix, boleto)
    cartao_final VARCHAR(4) NULL, -- Últimos 4 dígitos
    cartao_validade VARCHAR(5) NULL, -- MM/AA
    cartao_cvv VARCHAR(4) NULL, -- CVV simulado
    status VARCHAR(20) NOT NULL DEFAULT 'Confirmada', -- Status da reserva (Confirmada, Cancelada)
    data_reserva DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (imovel_id) REFERENCES imoveis(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Tabela de Mensagens (mensagens)
-- Armazena o histórico do chat
CREATE TABLE IF NOT EXISTS mensagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    imovel_id INT NOT NULL,
    remetente_id INT NOT NULL,
    destinatario_id INT NOT NULL,
    texto TEXT NOT NULL, -- Corrigido para a coluna 'texto'
    data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    visualizada TINYINT(1) NOT NULL DEFAULT 0,
    FOREIGN KEY (imovel_id) REFERENCES imoveis(id),
    FOREIGN KEY (remetente_id) REFERENCES usuarios(id),
    FOREIGN KEY (destinatario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Tabela de Avaliações (avaliacoes)
-- Armazena as notas e comentários dos locatários
CREATE TABLE IF NOT EXISTS avaliacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    imovel_id INT NOT NULL,
    usuario_id INT NOT NULL,
    nota INT NOT NULL, -- Nota de 1 a 5
    comentario TEXT,
    data_avaliacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    -- Garante que um usuário só avalie um imóvel uma vez (ou use ON DUPLICATE KEY UPDATE)
    UNIQUE KEY unique_review (imovel_id, usuario_id), 
    FOREIGN KEY (imovel_id) REFERENCES imoveis(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
