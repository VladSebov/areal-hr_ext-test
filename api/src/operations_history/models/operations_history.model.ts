import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';

@Entity('operations_history')
export class OperationsHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'operation_type', type: 'varchar', length: 50, nullable: false })
    operationType: string;

    @Column({ name: 'entity_type', type: 'varchar', length: 50, nullable: false })
    entityType: string;

    @Column({ name: 'entity_id', type: 'integer', nullable: false })
    entityId: number;

    @Column({ name: 'field_name', type: 'varchar', length: 50, nullable: true})
    fieldName: string | null;

    @Column({ name: 'old_value', type: 'text', nullable: true})
    oldValue: string | null;

    @Column({ name: 'new_value', type: 'text', nullable: true})
    newValue: string | null;

    @Column({ name: 'user_id', type: 'integer', nullable: true })
    userId: number | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}