# Админ-панель CRM

## Доступ к админ-панели

1. Откройте в браузере: `https://ваш-домен.com/crmadminauth`
2. Используйте учётные данные:
   - **Логин**: `admin`
   - **Пароль**: `admin123`
3. **⚠️ ВАЖНО**: Смените пароль сразу после первого входа!

## Функционал админ-панели

### Просмотр организаций
- Список всех зарегистрированных организаций
- Информация о тарифе, лимитах и использовании
- Дата создания и срок действия подписки
- Предупреждения о превышении лимитов или истекших тарифах

### Управление тарифами
Для каждой организации можно редактировать:
- **Тип тарифа**: free, basic, pro, enterprise
- **Период действия**: дата начала и дата окончания подписки
- **Лимиты**:
  - Количество пользователей
  - Количество матриц
  - Количество клиентов

## Backend Functions

### Авторизация админа
- **URL**: `https://functions.poehali.dev/d5fb271b-2690-4412-94b1-4b54d4294ebe`
- **Метод**: POST
- **Body**: 
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **Response**: 
  ```json
  {
    "token": "jwt-token-here",
    "username": "admin"
  }
  ```

### Управление организациями
- **URL**: `https://functions.poehali.dev/27c59523-c1ea-424b-a922-e5af28d26e5e`
- **Методы**:
  - `GET /` - список всех организаций
  - `PUT /:id` - обновить тариф организации
- **Headers**: 
  ```
  Authorization: Bearer {admin-token}
  ```

## Смена пароля администратора

Для смены пароля нужно обновить запись в таблице `admin_users`:

```sql
-- Сгенерировать хеш нового пароля (Python + bcrypt)
import bcrypt
password = "новый_пароль"
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
print(hashed.decode('utf-8'))

-- Обновить в БД
UPDATE admin_users 
SET password_hash = 'новый_хеш_здесь'
WHERE username = 'admin';
```

## Создание дополнительных администраторов

```sql
INSERT INTO admin_users (username, password_hash, created_at)
VALUES ('новый_админ', 'bcrypt_хеш_пароля', CURRENT_TIMESTAMP);
```

## Переменные окружения

Добавьте в `.env`:
```bash
VITE_ADMIN_AUTH_URL=https://functions.poehali.dev/d5fb271b-2690-4412-94b1-4b54d4294ebe
VITE_ADMIN_ORGS_URL=https://functions.poehali.dev/27c59523-c1ea-424b-a922-e5af28d26e5e
```
