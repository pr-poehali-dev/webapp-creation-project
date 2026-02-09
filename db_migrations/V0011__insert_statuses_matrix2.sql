-- Статусы для Матрицы 2: Сложное техническое оборудование

-- Статусы для критерия 12: Финансирование проекта (0-3)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(12, 'Не утверждено', 0, 0),
(12, 'На согласовании', 2, 1),
(12, 'Бюджет выделен', 3, 2);

-- Статусы для критерия 13: Инфраструктурная готовность (0-3)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(13, 'Нужна реконструкция', 0, 0),
(13, 'Частично готово', 2, 1),
(13, 'Готово к установке', 3, 2);

-- Статусы для критерия 14: Срок замены оборудования (0-5)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(14, 'Более 5 лет', 0, 0),
(14, '3-5 лет', 2, 1),
(14, '2-3 года', 3, 2),
(14, 'Менее 2 лет', 4, 3),
(14, 'Аварийное состояние', 5, 4);

-- Статусы для критерия 15: Техническая экспертиза (0-2)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(15, 'Нет специалистов', 0, 0),
(15, 'Базовые знания', 1, 1),
(15, 'Сертифицированные', 2, 2);

-- Статусы для критерия 16: Конкурентная ситуация (0-3)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(16, 'Выбран конкурент', 0, 0),
(16, 'Рассматривают варианты', 2, 1),
(16, 'Мы фавориты', 3, 2);

-- Статусы для критерия 17: Стоимость жизненного цикла (0-5)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(17, 'Экономия < 5%', 0, 0),
(17, 'Экономия 5-10%', 2, 1),
(17, 'Экономия 10-20%', 3, 2),
(17, 'Экономия 20-30%', 4, 3),
(17, 'Экономия > 30%', 5, 4);

-- Статусы для критерия 18: Объём закупки (0-5)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(18, '1 единица', 0, 0),
(18, '2-3 единицы', 2, 1),
(18, '4-5 единиц', 3, 2),
(18, '6-10 единиц', 4, 3),
(18, 'Более 10 или фрейм', 5, 4);

-- Статусы для критерия 19: Дополнительные сервисы (0-3)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(19, 'Только гарантия', 0, 0),
(19, '+ Техобслуживание', 2, 1),
(19, '+ Обучение + апгрейды', 3, 2);

-- Статусы для критерия 20: Стратегическая важность (0-3)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(20, 'Вспомогательное', 0, 0),
(20, 'Важное', 2, 1),
(20, 'Критическое', 3, 2);

-- Статусы для критерия 21: Референсная ценность (0-2)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(21, 'Региональный клиент', 0, 0),
(21, 'Отраслевой игрок', 1, 1),
(21, 'Флагманский проект', 2, 2);

-- Статусы для критерия 22: Зрелость потребности (универсальный, 0-10)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(22, 'Не осознаёт потребность', 0, 0),
(22, 'Слабое понимание', 3, 1),
(22, 'Осознаёт проблему', 5, 2),
(22, 'Активно ищет решение', 7, 3),
(22, 'Критическая необходимость', 10, 4);