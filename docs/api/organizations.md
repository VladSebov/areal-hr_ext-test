# Организации (`/organizations`)

Модель данных `Organization`:

- `id` (number) - Уникальный идентификатор
- `name` (string) - Название организации
- `comment` (string, optional) - Комментарий
- `deletedAt` (string|null) - Дата мягкого удаления

## GET /organizations

Возвращает список активных организаций (без удалённых), отсортированный по `id` ASC.

Ответ: массив Organization.

Пример:

```json
[
{
"id": 1,
"name": "Главный офис",
"comment": "г. Москва, ул. Центральная, д. 1",
"deletedAt": null
},
{
"id": 2,
"name": "Филиал Север",
"comment": "г. Санкт-Петербург, пр. Северный, д. 10",
"deletedAt": null
}
]
```

## GET /organizations/:id

Возвращает одну организацию по ID.

Параметры пути: `id` (number)

Ошибки: 404 - не найдена.

## POST /organizations

Создаёт новую организацию.

Тело (CreateOrganizationDto):

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| `name` | string | да | Название |
| `comment` | string | нет | Комментарий |

Пример запроса:

```json
{
"name": "Центральный офис",
"comment": "Новое здание"
}
```

Ответ: 201 Created, созданная Organization.

## PATCH /organizations/:id

Обновляет существующую организацию. Все поля в UpdateOrganizationDto опциональны.

Параметры пути: `id` (number)

Тело: любые поля из Organization (кроме id)

Ошибки: 404 - не найдена.

Ответ: обновлённая Organization.

## DELETE /organizations/:id

Мягкое удаление (soft-delete). Устанавливает `deletedAt`.

Ошибки: 404 - не найдена.

Ответ:

```json
{
"message": "Organization #42 soft-deleted"
}
```

## Примечания

- При старте приложения автоматически создаются три организации (seed), если таблица пуста.
- Удалённые организации не отображаются в `GET /organizations`, но доступны через прямые запросы не предусмотрено.