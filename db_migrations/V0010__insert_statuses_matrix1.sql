-- Статусы для Матрицы 1: Продажи ИИ-продуктов

-- Статусы для критерия 1: Цифровая зрелость бизнеса (0-5)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(1, 'Бумажные процессы', 0, 0),
(1, 'Частичная автоматизация', 2, 1),
(1, 'Цифровые системы', 4, 2),
(1, 'Интегрированная платформа', 5, 3);

-- Статусы для критерия 2: Готовность данных к анализу (0-5)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(2, 'Не структурированы', 0, 0),
(2, 'Частично структурированы', 2, 1),
(2, 'Чистые данные', 4, 2),
(2, 'Размечены для ML', 5, 3);

-- Статусы для критерия 3: Внутренняя техническая экспертиза (0-5)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(3, 'Нет IT-специалистов', 0, 0),
(3, 'Базовая поддержка', 2, 1),
(3, 'Внутренняя разработка', 4, 2),
(3, 'Команда + аналитики', 5, 3);

-- Статусы для критерия 4: Культура инноваций (0-3)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(4, 'Консервативны', 0, 0),
(4, 'Рассматривают новое', 1, 1),
(4, 'Готовы к пилоту', 2, 2),
(4, 'Активно тестируют', 3, 3);

-- Статусы для критерия 5: Ограничения отрасли/регуляторики (0-2)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(5, 'Жёсткие требования', 0, 0),
(5, 'Умеренные', 1, 1),
(5, 'Минимальные', 2, 2);

-- Статусы для критерия 6: Годовой бюджет на инновации (0-5)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(6, 'Менее 1 млн ₽', 0, 0),
(6, '1-3 млн ₽', 2, 1),
(6, '3-5 млн ₽', 3, 2),
(6, '5-10 млн ₽', 4, 3),
(6, 'Более 10 млн ₽', 5, 4);

-- Статусы для критерия 7: Масштаб применения (0-3)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(7, 'Один отдел', 0, 0),
(7, 'Несколько отделов', 2, 1),
(7, 'Корпоративный уровень', 3, 2);

-- Статусы для критерия 8: Срочность задачи (0-3)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(8, 'Нет острой боли', 0, 0),
(8, 'Есть проблема', 2, 1),
(8, 'Критическая боль', 3, 2);

-- Статусы для критерия 9: Лояльность к поставщику (0-2)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(9, 'Новый клиент', 0, 0),
(9, 'Работали ранее', 1, 1),
(9, 'Стратегический партнёр', 2, 2);

-- Статусы для критерия 10: Референсный потенциал (0-2)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(10, 'Низкий', 0, 0),
(10, 'Средний', 1, 1),
(10, 'Отраслевой лидер', 2, 2);

-- Статусы для критерия 11: Зрелость потребности (универсальный, 0-10)
INSERT INTO template_criterion_statuses (template_criterion_id, label, weight, sort_order) VALUES
(11, 'Не осознаёт потребность', 0, 0),
(11, 'Слабое понимание', 3, 1),
(11, 'Осознаёт проблему', 5, 2),
(11, 'Активно ищет решение', 7, 3),
(11, 'Критическая необходимость', 10, 4);