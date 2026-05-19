# Департаменты (`/departments`)

Модель данных `Department`:

- `id` (number) - Уникальный идентификатор
- `name` (string) - Название департамента (2-255 символов)
- `comment` (string, optional) - Комментарий (до 500 символов)
- `organization` (object) - Организация с полем `id`
- `parent` (object|null) - Родительский департамент (для иерархии)
- `children` (array) - Дочерние департаменты
- `deletedAt` (string|null) - Дата мягкого удаления

## GET /departments

Возвращает список активных департаментов (без удалённых) с организациями и родительскими департаментами.

Параметры: нет

Ответ: массив Department

Пример ответа:

```json
[
{
"id": 1,
"name": "Администрация",
"comment": "Руководство компании",
"organization": { "id": 1 },
"parent": null,
"deletedAt": null
},
{
"id": 2,
"name": "IT-отдел",
"comment": "Разработка и поддержка",
"organization": { "id": 1 },
"parent": null
},
{
"id": 4,
"name": "Группа Frontend-разработки",
"comment": null,
"organization": { "id": 1 },
"parent": { "id": 2 }
}
]
```

## GET /departments/:id

Возвращает один департамент со всеми связями (organization, parent, children).

Параметры пути: `id` (number)

Ошибки: 404 - не найден

Ответ:

```json
{
"id": 2,
"name": "IT-отдел",
"comment": "Разработка и поддержка",
"organization": { "id": 1 },
"parent": null,
"children": [
{ "id": 4, "name": "Группа Frontend-разработки" }
]
}
```

## POST /departments

Создаёт новый департамент.

Тело (CreateDepartmentDto):

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| `name` | string | да | 2-255 символов |
| `comment` | string | нет | до 500 символов |
| `organizationId` | number | да | ID организации |
| `parentId` | number | нет | ID родительского департамента |

Пример запроса:

```json
{
"name": "Бухгалтерия",
"comment": "Финансовый отдел",
"organizationId": 1,
"parentId": 1
}
```

Ответ: 201 Created, созданный Department.

## PATCH /departments/:id

Обновляет департамент. Все поля в UpdateDepartmentDto опциональны (те же поля, что в CreateDepartmentDto).

Параметры пути: `id` (number)

Тело: любые поля из Department (кроме id)

Ошибки: 404 - не найден

Ответ: обновлённый Department.

## DELETE /departments/:id

Мягкое удаление (soft-delete). Устанавливает `deletedAt`.

Ошибки: 404 - не найден

Ответ:

```json
{
"message": "Department #42 successfully soft-deleted"
}
```

## Примечания

- При создании/обновлении `parentId` можно установить в `null` для удаления связи с родителем.
- Департаменты с `deletedAt` не отображаются в GET /departments, но могут быть доступны через другие методы (не реализовано в текущем сервисе).