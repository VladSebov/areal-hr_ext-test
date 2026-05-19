# Пользователи (`/users`)

Модель данных `User`:

- `id` (number) - Уникальный идентификатор
- `lastName` (string) - Фамилия
- `firstName` (string) - Имя
- `middleName` (string, optional) - Отчество
- `login` (string) - Логин (уникальный)
- `role` (object) - Роль (связь)
- `employee` (object) - Сотрудник (связь)
- `createdAt` (string, date-time) - Дата создания
- `updatedAt` (string, date-time) - Дата обновления
- `deletedAt` (string, date-time|null) - Дата мягкого удаления

Примечание: поле `passwordHash` не возвращается в обычных запросах.

## GET /users

Возвращает список активных пользователей (у которых `deletedAt` IS NULL и связанный сотрудник не удалён), с подгрузкой `role` и `employee`.

Параметры запроса (Query):

| Параметр | Тип | Описание |
|----------|-----|----------|
| `search` | string | Поиск по `login`, `employee.lastName`, `employee.firstName` |
| `roleId` | number | Фильтр по ID роли |

Пример: `GET /users?search=админ&roleId=1`

Ответ: массив User.

Пример:

```json
[
{
"id": 1,
"lastName": "Системный",
"firstName": "Администратор",
"middleName": "Главный",
"login": "admin",
"role": { "id": 1, "role": "Администратор" },
"employee": { "id": 1, "lastName": "Системный", "firstName": "Администратор" },
"createdAt": "2025-01-01T00:00:00.000Z",
"updatedAt": "2025-01-01T00:00:00.000Z",
"deletedAt": null
}
]
```

## GET /users/:id

Возвращает одного пользователя по ID.

Параметры пути: `id` (number)

Ошибки: 404 - пользователь не найден или связанный сотрудник удалён.

## POST /users

Создаёт нового пользователя. Пароль хешируется автоматически.

Тело (CreateUserDto):

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| `lastName` | string | да | Фамилия (до 50) |
| `firstName` | string | да | Имя (до 50) |
| `middleName` | string | нет | Отчество (до 50) |
| `login` | string | да | Логин (4-100 символов, уникальный) |
| `password` | string | да | Пароль (минимум 8 символов) |
| `roleId` | number | да | ID роли |
| `employeeId` | number | да | ID сотрудника |

Пример запроса:

```json
{
"lastName": "Петров",
"firstName": "Петр",
"login": "petrov.p",
"password": "securePass123",
"roleId": 2,
"employeeId": 10
}
```

Ответ: 201 Created, созданный User (без поля `passwordHash`).

Ошибки: 400 - логин уже занят (включая удалённых пользователей).

## PATCH /users/:id

Обновляет пользователя. Все поля опциональны.

Параметры пути: `id` (number)

Тело: любые поля из `UpdateUserDto` (аналогично CreateUserDto, но все опциональны).

Пример:

```json
{
"login": "newlogin",
"password": "newPass456"
}
```

Ответ: обновлённый User (без пароля).

Ошибки: 404 - не найден.

## DELETE /users/:id

Мягкое удаление пользователя (устанавливает `deletedAt`).

Ошибки: 404 - не найден.

Ответ:

```json
{
"message": "User #42 successfully soft-removed"
}
```

## Дополнительные методы (внутренние, но доступны через сервис)

### softRemoveByEmployee(employeeId)
Деактивирует все учётные записи, привязанные к сотруднику. Вызывается автоматически при увольнении.

### restoreByEmployee(employeeId)
Восстанавливает учётную запись сотрудника (последнюю деактивированную). Вызывается при удалении кадровой операции увольнения.

## Примечания

- При старте приложения автоматически создаётся администратор (логин и пароль из переменных окружения `ADMIN_LOGIN` / `ADMIN_PASSWORD`, по умолчанию `admin` / `admin123`). Требуется наличие роли `Администратор`.
- Поле `passwordHash` исключено из сериализации по умолчанию (`select: false`).