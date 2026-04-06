import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    OneToMany,
} from 'typeorm';
import { HrOperation } from '../../hr_operations/models/hr_operation.model';
import { User } from '../../users/models/user.model';
import {PassportScan} from "../../passport_scans/models/passport_scan.model";

@Entity('employees')
export class Employee {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 50 })
    lastName: string;

    @Column({ type: 'varchar', length: 50 })
    firstName: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    middleName: string;

    @Column({ type: 'date' })
    birthDate: Date;

    @Column({ type: 'varchar', length: 4 })
    passportSeries: string;

    @Column({ type: 'varchar', length: 6 })
    passportNumber: string;

    @Column({ type: 'date', nullable: true })
    passportDate: Date;

    @Column({ type: 'varchar', length: 6 })
    passportCode: string;

    @Column({ type: 'text' })
    passportPlace: string;

    @Column({ type: 'varchar', length: 100 })
    registrationRegion: string;

    @Column({ type: 'varchar', length: 100 })
    registrationLocality: string;

    @Column({ type: 'varchar', length: 100 })
    registrationStreet: string;

    @Column({ type: 'varchar', length: 10 })
    registrationHouse: string;

    @Column({ type: 'varchar', length: 10, nullable: true })
    registrationHousing: string;

    @Column({ type: 'varchar', length: 10, nullable: true })
    registrationApartment: string;

    @OneToMany(() => HrOperation, (op) => op.employee)
    operations: HrOperation[];

    @OneToMany(() => PassportScan, (scan) => scan.employee)
    passportScans: PassportScan[];

    @OneToMany(() => User, (user) => user.employee)
    users: User[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}