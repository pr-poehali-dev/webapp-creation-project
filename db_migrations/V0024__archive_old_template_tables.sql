-- Финальная очистка: удаление временных mapping-таблиц и старых таблиц

-- Шаг 1: Удаление временных mapping-таблиц (больше не нужны)
ALTER TABLE temp_template_id_mapping RENAME TO old_temp_template_id_mapping;
ALTER TABLE temp_criterion_id_mapping RENAME TO old_temp_criterion_id_mapping;

-- Шаг 2: Переименование старых таблиц (для возможности отката если что-то пойдет не так)
ALTER TABLE matrix_templates RENAME TO old_matrix_templates;
ALTER TABLE template_criteria RENAME TO old_template_criteria;
ALTER TABLE template_criterion_statuses RENAME TO old_template_criterion_statuses;

-- Комментарии для истории
COMMENT ON TABLE old_matrix_templates IS 'DEPRECATED: migrated to matrices with is_template=TRUE (V0020)';
COMMENT ON TABLE old_template_criteria IS 'DEPRECATED: migrated to matrix_criteria (V0021)';
COMMENT ON TABLE old_template_criterion_statuses IS 'DEPRECATED: migrated to criterion_statuses (V0022)';
COMMENT ON TABLE old_temp_template_id_mapping IS 'Migration mapping table - can be dropped after verification';
COMMENT ON TABLE old_temp_criterion_id_mapping IS 'Migration mapping table - can be dropped after verification';
