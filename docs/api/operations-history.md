# История операций (`/operations-history`)

Модель данных `OperationsHistory` (аудит изменений):

- `id` (number) - Уникальный идентификатор записи аудита
- `operationType` (string) - Тип операции (CREATE, UPDATE, DELETE и т.д.)
- `entityType` (string) - Тип сущности (Employee, Department, File и т.д.)
- `entityId` (number) - ID изменённой сущности
- `fieldName` (string|null) - Название изменённого поля (для UPDATE)
- `oldValue` (string|null) - Старое значение (текстовое представление)
- `newValue` (string|null) - Новое значение
- `userId` (number|null) - ID пользователя, выполнившего операцию
- `createdAt` (string, date-time) - Дата и время операции

## GET /operations-history

Возвращает историю изменений с возможностью фильтрации.

Параметры запроса (Query):

| Параметр | Тип | Описание |
|----------|-----|----------|
| `entityName` | string | Название сущности (entityType) |
| `entityId` | number | ID сущности |

Фильтры опциональны. Если не указаны – возвращаются все записи, отсортированные по `createdAt` DESC.

Пример запроса: `GET /operations-history?entityName=Employee&entityId=42`

Пример ответа:

```json
[
{
"id": 101,
"operationType": "UPDATE",
"entityType": "Employee",
"entityId": 42,
"fieldName": "lastName",
"oldValue": "Ivanov",
"newValue": "Petrov",
"userId": 5,
"createdAt": "2025-01-20T14:23:10.000Z"
},
{
"id": 100,
"operationType": "CREATE",
"entityType": "Employee",
"entityId": 42,
"fieldName": null,
"oldValue": null,
"newValue": null,
"userId": 3,
"createdAt": "2025-01-20T09:15:00.000Z"
}
]
```

## GET /operations-history/:id

Возвращает одну запись аудита по ID.

Параметры пути: `id` (number)

Ошибки: 404 - запись не найдена.

Пример ответа:

```json
{
"id": 101,
"operationType": "UPDATE",
"entityType": "Employee",
"entityId": 42,
"fieldName": "lastName",
"oldValue": "Ivanov",
"newValue": "Petrov",
"userId": 5,
"createdAt": "2025-01-20T14:23:10.000Z"
}
```

## Примечания

- Данный эндпоинт только для чтения. Записи создаются автоматически через механизм аудита (не в этом сервисе).
- Поля `oldValue`/`newValue` хранятся в текстовом формате (например, JSON для сложных изменений).