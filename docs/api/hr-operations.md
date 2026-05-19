# Кадровые операции (`/hr-operations`)

Модель данных `HrOperation`:

- `id` (number) - Уникальный идентификатор
- `operationType` (string) - Тип операции (`HIRE` или `DISMISSAL`)
- `salary` (number) - Зарплата
- `employee` (object) - Сотрудник (связь)
- `department` (object) - Департамент (связь)
- `position` (object) - Должность (связь)
- `createdAt` (string, date-time) - Дата создания
- `deletedAt` (string, date-time|null) - Дата мягкого удаления

## GET /hr-operations

Возвращает список активных операций (без удалённых) с подгрузкой `employee`, `department`, `position`, отсортированный по `createdAt` DESC.

Ответ: массив HrOperation.

Пример:

```json
[
{
"id": 1,
"operationType": "HIRE",
"salary": 75000,
"employee": { "id": 1, "firstName": "Иван" },
"department": { "id": 1, "name": "IT-отдел" },
"position": { "id": 3, "name": "Разработчик" },
"createdAt": "2025-01-15T10:00:00.000Z",
"deletedAt": null
}
]
```

## GET /hr-operations/:id

Возвращает одну операцию по ID.

Параметры пути: `id` (number)

Ошибки: 404 - не найдена.

## POST /hr-operations

Создаёт кадровую операцию. Если `operationType = "DISMISSAL"`, дополнительно:
- мягко удаляет сотрудника (EmployeesService.remove)
- деактивирует связанного пользователя (UsersService.softRemoveByEmployee)

Тело (CreateHrOperationDto):

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| `employeeId` | number | да | ID сотрудника |
| `departmentId` | number | да | ID департамента |
| `positionId` | number | да | ID должности |
| `salary` | number | да | Зарплата |
| `operationType` | string | да | `HIRE` или `DISMISSAL` |

Пример запроса:

```json
{
"employeeId": 1,
"departmentId": 1,
"positionId": 3,
"salary": 75000,
"operationType": "HIRE"
}
```

Ответ: 201 Created, созданная HrOperation.

## PATCH /hr-operations/:id

Обновляет операцию. Все поля в UpdateHrOperationDto опциональны (те же, что в CreateHrOperationDto).

Параметры пути: `id` (number)

Ошибки: 404 - не найдена.

Ответ: обновлённая HrOperation.

## DELETE /hr-operations/:id

Мягкое удаление операции. **Удалить можно только последнюю операцию в истории сотрудника** (по `createdAt`). При удалении операции типа `DISMISSAL` автоматически:
- восстанавливает сотрудника (EmployeesService.restore)
- восстанавливает пользователя (UsersService.restoreByEmployee)

Ошибки:
- 404 - операция не найдена
- 400 - операция не привязана к сотруднику
- 400 - операция не является последней

Ответ:

```json
{
"message": "HR Operation #42 successfully soft-removed"
}
```

## Примечания

- При старте приложения создаётся тестовая операция (приём на работу, если существуют Employee #1 и Position #3).
- Удалённые операции не отображаются в `GET /hr-operations`.
- Каскадные действия при увольнении/восстановлении выполняются в сервисе автоматически.