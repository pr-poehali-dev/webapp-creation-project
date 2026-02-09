-- Удаляем ограничение на вес статусов, которое блокирует weight=0
ALTER TABLE criterion_statuses DROP CONSTRAINT IF EXISTS criterion_statuses_weight_check;