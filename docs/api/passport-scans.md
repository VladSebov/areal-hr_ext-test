# Скан-копии паспортов (`/passport-scans`)

Модель данных `PassportScan`:

- `id` (number) - Уникальный идентификатор
- `employee` (object) - Сотрудник (связь)
- `file` (object) - Файл скан-копии (связь)
- `createdAt` (string, date-time) - Дата создания
- `deletedAt` (string, date-time|null) - Дата мягкого удаления

## GET /passport-scans

Возвращает список всех активных скан-копий (без удалённых) с подгрузкой `employee` и `file`, отсортированный по `createdAt` DESC.

Ответ: массив PassportScan.

Пример:

```json
[
{
"id": 1,
"employee": { "id": 42, "lastName": "Иванов" },
"file": { "id": 99, "name": "passport_scan.pdf" },
"createdAt": "2025-01-20T10:00:00.000Z",
"deletedAt": null
}
]
```

## GET /passport-scans/:id

Возвращает одну скан-копию по ID.

Параметры пути: `id` (number)

Ошибки: 404 - не найдена.

## GET /passport-scans/employee/:employeeId

Возвращает все скан-копии для конкретного сотрудника (без удалённых), с подгрузкой `file`, отсортированные по `createdAt` DESC.

Параметры пути: `employeeId` (number)

Пример ответа: массив PassportScan.

## POST /passport-scans

Создаёт связь между сотрудником и файлом-сканом.

Тело (CreatePassportScanDto):

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| `employeeId` | number | да | ID сотрудника |
| `fileId` | number | да | ID файла (скан-копии) |

Пример запроса:

```json
{
"employeeId": 42,
"fileId": 99
}
```

Ответ: 201 Created, созданный PassportScan.

## DELETE /passport-scans/:id

Мягкое удаление скан-копии (устанавливает `deletedAt`).

Ошибки: 404 - не найдена.

Ответ:

```json
{
"message": "Passport scan #42 successfully soft-deleted"
}
```

## Примечания

- Скан-копии не хранят сам файл, а ссылаются на сущность `File` (см. документацию файлов).
- При удалении скан-копии сам файл в MinIO не удаляется.