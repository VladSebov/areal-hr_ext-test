import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    UpdateEvent,
    SoftRemoveEvent,
    DataSource,
} from 'typeorm';
import { OperationsHistory } from './models/operations_history.model';
import { Employee } from '../employees/models/employee.model';
import { HrOperation } from '../hr_operations/models/hr_operation.model';

@EventSubscriber()
export class OperationsHistorySubscriber implements EntitySubscriberInterface {
    constructor(dataSource: DataSource) {
        dataSource.subscribers.push(this);
    }

    async afterInsert(event: InsertEvent<any>) {
        if (event.metadata.target === OperationsHistory) return;
        if (!event.entity) return;
        const repo = event.manager.getRepository(OperationsHistory);
        const history = repo.create({
            operationType: 'CREATE',
            entityType: event.metadata.name,
            entityId: event.entity.id,
            newValue: 'Entity created',
        });
        await repo.save(history);
    }

    async afterUpdate(event: UpdateEvent<any>) {
        if (!event.entity || !event.databaseEntity) return;

        const repo = event.manager.getRepository(OperationsHistory);
        const entityName = event.metadata.name;
        const entityId = event.databaseEntity.id;

        const updatedColumns = event.updatedColumns.map(col => col.propertyName);
        const historyEntries: OperationsHistory[] = [];

        for (const field of updatedColumns) {
            const oldVal = event.databaseEntity[field];
            const newVal = event.entity[field];

            if (oldVal !== newVal) {
                historyEntries.push(
                    repo.create({
                        operationType: 'UPDATE',
                        entityType: entityName,
                        entityId: entityId,
                        fieldName: field,
                        oldValue: oldVal?.toString(),
                        newValue: newVal?.toString(),
                    }),
                );
            }
        }

        if (historyEntries.length > 0) {
            await repo.save(historyEntries);
        }
    }


    async afterSoftRemove(event: SoftRemoveEvent<any>) {
        const repository = event.manager.getRepository(OperationsHistory);

        const entityId = event.entity?.id;
        const entityName = event.metadata.name;

        if (!entityId) return;

        await repository.save({
            operationType: 'DELETE',
            entityType: entityName,
            entityId: entityId,
            fieldName: 'deletedAt',
            oldValue: null,
            newValue: new Date().toISOString(),
        });
    }
}