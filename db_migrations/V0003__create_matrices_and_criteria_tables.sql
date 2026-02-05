CREATE TABLE IF NOT EXISTS matrices (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_matrix_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_matrix_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS matrix_criteria (
    id SERIAL PRIMARY KEY,
    matrix_id INTEGER NOT NULL,
    axis VARCHAR(10) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    weight INTEGER DEFAULT 1,
    min_value INTEGER DEFAULT 0,
    max_value INTEGER DEFAULT 10,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_axis CHECK (axis IN ('x', 'y')),
    CONSTRAINT fk_criteria_matrix FOREIGN KEY (matrix_id) REFERENCES matrices(id)
);

CREATE INDEX IF NOT EXISTS idx_matrices_organization ON matrices(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_matrices_created_by ON matrices(created_by);
CREATE INDEX IF NOT EXISTS idx_criteria_matrix ON matrix_criteria(matrix_id, axis);