-- Создание таблицы правил квадрантов

CREATE TABLE matrix_quadrant_rules (
  id SERIAL PRIMARY KEY,
  matrix_id INTEGER NOT NULL,
  quadrant VARCHAR(20) NOT NULL,
  x_min NUMERIC(10,2) NOT NULL,
  y_min NUMERIC(10,2) NOT NULL,
  x_operator VARCHAR(10) DEFAULT 'AND',
  priority INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE matrix_quadrant_rules 
  ADD CONSTRAINT check_quadrant_value 
  CHECK (quadrant IN ('focus', 'grow', 'monitor', 'archive'));

ALTER TABLE matrix_quadrant_rules 
  ADD CONSTRAINT check_operator_value 
  CHECK (x_operator IN ('AND', 'OR'));

ALTER TABLE matrix_quadrant_rules 
  ADD CONSTRAINT unique_matrix_quadrant 
  UNIQUE(matrix_id, quadrant);

CREATE INDEX idx_quadrant_rules_matrix ON matrix_quadrant_rules(matrix_id);
CREATE INDEX idx_quadrant_rules_priority ON matrix_quadrant_rules(matrix_id, priority);

COMMENT ON TABLE matrix_quadrant_rules IS 'Flexible quadrant rules per matrix';
COMMENT ON COLUMN matrix_quadrant_rules.priority IS 'Rule check order: 1=first, 4=last';