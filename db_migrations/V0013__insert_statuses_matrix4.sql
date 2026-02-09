-- Статусы для Матрицы 4: Консалтинг

-- Статусы для критерия 34: Осознание проблемы (0-5)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(34, 'Не видят проблемы', 0, 0),
(34, 'Смутное понимание', 2, 1),
(34, 'Четко сформулирована', 4, 2),
(34, 'Острая боль', 5, 3);

-- Статусы для критерия 35: Готовность к изменениям (0-3)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(35, 'Сопротивление', 0, 0),
(35, 'Готовы обсуждать', 2, 1),
(35, 'Активно ищут изменений', 3, 2);

-- Статусы для критерия 36: Команда для внедрения (0-3)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(36, 'Нет ресурсов', 0, 0),
(36, 'Частичная загрузка', 2, 1),
(36, 'Выделенная команда', 3, 2);

-- Статусы для критерия 37: Предыдущий опыт (0-3)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(37, 'Первый проект', 0, 0),
(37, 'Был негативный опыт', 1, 1),
(37, 'Был положительный опыт', 3, 2);

-- Статусы для критерия 38: Срочность проекта (0-5)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(38, 'Нет дедлайнов', 0, 0),
(38, 'Плановая инициатива', 2, 1),
(38, 'Месяц-квартал', 4, 2),
(38, 'Критический срок', 5, 3);

-- Статусы для критерия 39: Бюджет проекта (0-5)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(39, 'Менее 500 тыс. ₽', 0, 0),
(39, '500 тыс. - 1 млн ₽', 1, 1),
(39, '1-3 млн ₽', 2, 2),
(39, '3-5 млн ₽', 3, 3),
(39, '5-10 млн ₽', 4, 4),
(39, 'Более 10 млн ₽', 5, 5);

-- Статусы для критерия 40: Масштаб влияния (0-3)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(40, 'Один отдел', 0, 0),
(40, 'Несколько подразделений', 2, 1),
(40, 'Вся компания', 3, 2);

-- Статусы для критерия 41: Долгосрочное партнёрство (0-3)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(41, 'Разовый проект', 0, 0),
(41, 'Потенциал продолжения', 2, 1),
(41, 'Стратегический партнёр', 3, 2);

-- Статусы для критерия 42: Уровень принятия решения (0-3)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(42, 'Средний менеджмент', 0, 0),
(42, 'Топ-менеджер', 2, 1),
(42, 'Собственник / совет', 3, 2);

-- Статусы для критерия 43: Референсный статус (0-2)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(43, 'Обычный клиент', 0, 0),
(43, 'Известный в отрасли', 1, 1),
(43, 'Лидер рынка', 2, 2);

-- Статусы для критерия 44: Зрелость потребности (универсальный, 0-10)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(44, 'Не осознаёт потребность', 0, 0),
(44, 'Слабое понимание', 3, 1),
(44, 'Осознаёт проблему', 5, 2),
(44, 'Активно ищет решение', 7, 3),
(44, 'Критическая необходимость', 10, 4);