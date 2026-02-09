-- Миграция статусов критериев из template_criterion_statuses в criterion_statuses
-- Связываем через temp_criterion_id_mapping (старый ID критерия → новый ID)

INSERT INTO criterion_statuses (
  criterion_id, 
  label, 
  weight, 
  sort_order, 
  created_at
)
SELECT 
  tcm.new_criterion_id,
  tcs.label,
  CAST(tcs.weight AS INTEGER),
  tcs.sort_order,
  tcs.created_at
FROM template_criterion_statuses tcs
JOIN temp_criterion_id_mapping tcm ON tcs.template_criterion_id = tcm.old_criterion_id
ORDER BY tcs.template_criterion_id, tcs.sort_order;
