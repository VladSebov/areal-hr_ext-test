# Сотрудники (`/employees`)

Модель данных `Employee`:

- `id` (number) - Уникальный идентификатор
- `firstName` (string) - Имя
- `lastName` (string) - Фамилия
- `middleName` (string) - Отчество
- `birthDate` (string, date) - Дата рождения `YYYY-MM-DD`
- `passportSeries` (string) - Серия паспорта
- `passportNumber` (string) - Номер паспорта
- `registrationRegion` (string) - Область/регион регистрации
- `registrationLocality` (string) - Населенный пункт
- `deletedAt` (string|null) - Дата увольнения
- `passportScans` (array) - Скан-копии паспорта (вложенный `file` с `id`, `name`, `path`)
- `operations` (array) - Связанные операции
- `users` (array) - Связанные пользователи

## GET /employees

Параметры:

- `search` (string) - Поиск по lastName, firstName, passportNumber
- `showDeleted` (boolean) - Включить уволенных
- `region` (string) - Фильтр по registrationRegion
- `locality` (string) - Фильтр по registrationLocality

Ответ: массив Employee

## GET /employees/filter-values

Ответ:
```json
{
"regions": ["Московская область", "Тверская область"],
"localities": ["г. Москва", "г. Одинцово"]
}
```

## GET /employees/:id

Параметры пути: `id` (number)

Ответ: полный объект Employee со всеми связями

Ошибки: 404 - не найден

## POST /employees

Тело: CreateEmployeeDto (firstName, lastName, middleName, birthDate, passportSeries, passportNumber, registrationRegion, registrationLocality)

Ответ: 201 Created, созданный Employee

## PATCH /employees/:id

Параметры пути: `id` (number)

Тело: UpdateEmployeeDto (любые поля из Employee)

Ошибки:
- 404 - не найден
- 400 - сотрудник уволен (deletedAt не null)

Ответ: обновленный Employee

## DELETE /employees/:id

Параметры пути: `id` (number)

Эффект: soft-remove (установка deletedAt)

Ошибки:
- 404 - не найден
- 400 - уже уволен

Ответ:
```json
{
"message": "Employee #42 successfully soft-deleted"
}
```

## PATCH /employees/:id/restore

Параметры пути: `id` (number)

Эффект: восстановление (очистка deletedAt)

Ошибка: 404 - не найден (включая удаленных)

Ответ при восстановлении:
```json
{
"message": "Employee #42 successfully restored"
}
```

Ответ если уже активен:
```json
{
"message": "Employee #42 is already active"
}
```