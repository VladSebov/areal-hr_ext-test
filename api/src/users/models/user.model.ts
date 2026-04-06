import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    JoinColumn,
} from 'typeorm';
import { Role } from '../../roles/models/role.model';
import { Employee } from '../../employees/models/employee.model';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 50 })
    lastName: string;

    @Column({ type: 'varchar', length: 50 })
    firstName: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    middleName: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    login: string;

    @Column({ type: 'varchar', length: 255, select: false }) // select: false скрывает хеш пароля в обычных запросах
    passwordHash: string;

    @ManyToOne(() => Role, (role) => role.users, { nullable: false })
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @ManyToOne(() => Employee, (emp) => emp.users, { nullable: false })
    @JoinColumn({ name: 'employee_id' })
    employee: Employee;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}