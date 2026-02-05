-- Таблица клиентов с привязкой к организации и матрице
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    matrix_id INTEGER REFERENCES matrices(id),
    
    -- Основная информация о клиенте
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    
    -- Описание и заметки
    description TEXT,
    notes TEXT,
    
    -- Оценки по осям X и Y (рассчитываются из критериев)
    score_x DECIMAL(10, 2) DEFAULT 0,
    score_y DECIMAL(10, 2) DEFAULT 0,
    
    -- Квадрант (focus, grow, monitor, archive)
    quadrant VARCHAR(20),
    
    -- Метаданные
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица оценок клиента по каждому критерию матрицы
CREATE TABLE IF NOT EXISTS client_scores (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    criterion_id INTEGER NOT NULL REFERENCES matrix_criteria(id),
    
    -- Оценка по критерию (от min_value до max_value из matrix_criteria)
    score DECIMAL(10, 2) NOT NULL,
    
    -- Комментарий к оценке
    comment TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(client_id, criterion_id)
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_clients_organization ON clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_clients_matrix ON clients(matrix_id);
CREATE INDEX IF NOT EXISTS idx_clients_quadrant ON clients(quadrant);
CREATE INDEX IF NOT EXISTS idx_clients_active ON clients(is_active);
CREATE INDEX IF NOT EXISTS idx_client_scores_client ON client_scores(client_id);
CREATE INDEX IF NOT EXISTS idx_client_scores_criterion ON client_scores(criterion_id);