# Файлы (`/files`)

Модель данных `File`:

- `id` (number) - Уникальный идентификатор
- `bucketName` (string) - Название бакета в MinIO
- `objectKey` (string) - Ключ объекта в бакете
- `name` (string) - Оригинальное имя файла
- `mimeType` (string) - MIME-тип файла
- `fileSize` (number) - Размер в байтах (bigint)
- `createdAt` (string, date-time) - Дата создания
- `updatedAt` (string, date-time) - Дата обновления
- `deletedAt` (string, date-time|null) - Дата мягкого удаления

## POST /files/upload

Загружает файл в MinIO и создаёт запись в БД.

Параметры: multipart/form-data, поле `file` (файл).

Ответ: 201 Created, объект File.

Пример ответа:

```json
{
"id": 10,
"bucketName": "arealtz-uploads",
"objectKey": "1678901234567-document.pdf",
"name": "document.pdf",
"mimeType": "application/pdf",
"fileSize": 102400,
"createdAt": "2025-01-15T10:30:00.000Z",
"updatedAt": "2025-01-15T10:30:00.000Z",
"deletedAt": null
}
```

## GET /files

Возвращает список всех активных (не удалённых) файлов, отсортированный по убыванию `createdAt`.

Ответ: массив File.

## GET /files/:id

Возвращает информацию о файле по ID.

Параметры пути: `id` (number)

Ошибки: 404 - файл не найден.

## GET /files/:id/presigned-url

Генерирует временную прямую ссылку для скачивания файла из MinIO.

Параметры пути: `id` (number)

Ответ:

```
"https://minio.example.com/bucket/object?X-Amz-Expires=..."
```

Ошибки: 404 - файл не найден.

## DELETE /files/:id

Мягкое удаление файла (устанавливает `deletedAt`). Файл из MinIO **не удаляется** физически.

Параметры пути: `id` (number)

Ошибки: 404 - файл не найден.

Ответ:

```json
{
"message": "File #42 successfully soft-deleted"
}
```

## Примечания

- Все эндпоинты требуют авторизации (Guard).
- Для загрузки используйте `POST /files/upload` с типом `multipart/form-data`.
- Прямая ссылка действительна ограниченное время (настраивается в MinIOService).
- Физическое удаление файлов из MinIO не реализовано в данном сервисе.