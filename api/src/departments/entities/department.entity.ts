import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('departments')
export class Department {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    comment: string;

    @ManyToOne(() => Organization, (org) => org.departments)
    organization: Organization;

    @ManyToOne(() => Department, (dept) => dept.children, { nullable: true })
    parent: Department;

    @OneToMany(() => Department, (dept) => dept.parent)
    children: Department[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}