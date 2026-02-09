-- Статусы для Матрицы 3: Корпоративное ПО

-- Статусы для критерия 23: Интеграционная зрелость (0-5)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(23, 'Закрытые системы', 0, 0),
(23, 'Частичная интеграция', 3, 1),
(23, 'Полная интеграция через API', 5, 2);

-- Статусы для критерия 24: Масштаб внедрения (0-5)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(24, 'Менее 10 пользователей', 0, 0),
(24, '10-50 пользователей', 2, 1),
(24, '50-100 пользователей', 3, 2),
(24, '100-500 пользователей', 4, 3),
(24, 'Более 500 / мультифилиал', 5, 4);

-- Статусы для критерия 25: Готовность данных (0-3)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(25, '"Грязные" данные', 0, 0),
(25, 'Частично очищены', 2, 1),
(25, 'Чистые + процессы', 3, 2);

-- Статусы для критерия 26: ИТ-команда (0-3)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(26, 'Нет ресурсов', 0, 0),
(26, '1-2 человека', 2, 1),
(26, 'Команда + архитектор', 3, 2);

-- Статусы для критерия 27: Стандарты безопасности (0-2)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(27, 'Базовые', 0, 0),
(27, 'Отраслевые', 1, 1),
(27, 'Сертифицировано', 2, 2);

-- Статусы для критерия 28: Рентабельность проекта (0-5)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(28, 'ROI > 2 лет', 0, 0),
(28, 'ROI 18-24 мес', 2, 1),
(28, 'ROI 12-18 мес', 3, 2),
(28, 'ROI 6-12 мес', 4, 3),
(28, 'ROI < 6 мес / стратегический', 5, 4);

-- Статусы для критерия 29: Поддержка топ-менеджмента (0-3)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(29, 'Средний менеджмент', 0, 0),
(29, 'Заместитель директора', 2, 1),
(29, 'CEO / совет директоров', 3, 2);

-- Статусы для критерия 30: Конкурентное давление (0-3)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(30, 'Нет давления', 0, 0),
(30, 'Есть альтернативы', 2, 1),
(30, 'Критическая необходимость', 3, 2);

-- Статусы для критерия 31: Модель лицензирования (0-3)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(31, 'Бессрочная лицензия', 0, 0),
(31, 'Подписка 1-3 года', 2, 1),
(31, 'Многоуровневая + кастомизация', 3, 2);

-- Статусы для критерия 32: Потенциал кросс-продаж (0-2)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(32, 'Нет потенциала', 0, 0),
(32, '1-2 дополнительных модуля', 1, 1),
(32, 'Экосистема продуктов', 2, 2);

-- Статусы для критерия 33: Зрелость потребности (универсальный, 0-10)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(33, 'Не осознаёт потребность', 0, 0),
(33, 'Слабое понимание', 3, 1),
(33, 'Осознаёт проблему', 5, 2),
(33, 'Активно ищет решение', 7, 3),
(33, 'Критическая необходимость', 10, 4);