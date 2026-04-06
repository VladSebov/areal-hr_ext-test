import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';
import { Employee } from '../../employees/models/employee.model';
import { Department } from '../../departments/models/department.model';
import { Position } from '../../positions/models/position.model';

@Entity('hr_operations')
export class HrOperation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
    salary: number;

    @Column({ type: 'varchar', length: 50, nullable: true })
    operationType: string;

    @ManyToOne(() => Employee, (emp) => emp.operations, { nullable: false })
    @JoinColumn({ name: 'employee_id' })
    employee: Employee;

    @ManyToOne(() => Department, { nullable: false })
    @JoinColumn({ name: 'department_id' })
    department: Department;

    @ManyToOne(() => Position, { nullable: false })
    @JoinColumn({ name: 'position_id' })
    position: Position;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}