-- Добавление столбцов для названий осей матрицы
ALTER TABLE matrices 
ADD COLUMN IF NOT EXISTS axis_x_name VARCHAR(255) DEFAULT 'Ось X',
ADD COLUMN IF NOT EXISTS axis_y_name VARCHAR(255) DEFAULT 'Ось Y';