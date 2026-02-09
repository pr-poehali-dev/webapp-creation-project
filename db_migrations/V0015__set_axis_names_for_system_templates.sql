-- Заполняем названия осей для системных шаблонов матриц

-- Матрица 1: Продажи ИИ-продуктов
UPDATE matrix_templates SET 
    axis_x_name = 'Техническая готовность клиента',
    axis_y_name = 'Коммерческий потенциал'
WHERE id = 1;

-- Матрица 2: Сложное техническое оборудование
UPDATE matrix_templates SET 
    axis_x_name = 'Готовность к закупке',
    axis_y_name = 'Коммерческая ценность'
WHERE id = 2;

-- Матрица 3: Корпоративное ПО
UPDATE matrix_templates SET 
    axis_x_name = 'Техническая совместимость',
    axis_y_name = 'Бизнес-ценность'
WHERE id = 3;

-- Матрица 4: Консалтинг
UPDATE matrix_templates SET 
    axis_x_name = 'Готовность к изменениям',
    axis_y_name = 'Коммерческий потенциал'
WHERE id = 4;