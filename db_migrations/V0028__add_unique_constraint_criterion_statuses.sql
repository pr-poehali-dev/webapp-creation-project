-- Добавляем UNIQUE constraint для предотвращения дублей в будущем
ALTER TABLE criterion_statuses
ADD CONSTRAINT unique_criterion_status
UNIQUE (criterion_id, label, weight, sort_order);
