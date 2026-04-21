import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { User } from './models/user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(
      @InjectRepository(User)
      private readonly repo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.repo.findOne({ 
      where: { login: dto.login },
      withDeleted: true 
    });
    
    if (existing) {
      throw new BadRequestException('Login is already taken');
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = this.repo.create({
      ...dto,
      passwordHash,
      role: { id: dto.roleId },
      employee: { id: dto.employeeId },
    });

    const savedUser = await this.repo.save(user);
    const { passwordHash: _, ...result } = savedUser;
    return result as User;
  }

  async findAll(): Promise<User[]> {
    return await this.repo.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.employee', 'employee')
      .where('user.deletedAt IS NULL')
      .andWhere('employee.deletedAt IS NULL') 
      .orderBy('user.id', 'ASC')
      .getMany();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.repo.findOne({
      where: { id },
      relations: ['role', 'employee'],
    });

    if (!user || user.employee?.deletedAt) {
      throw new NotFoundException(`Пользователь не найден или связанный сотрудник уволен`);
    }

    return user;
  }

  async findOneByLogin(login: string): Promise<User | null> {
    return this.repo.findOne({
      where: { login },
      relations: ['role', 'employee'],
      select: ['id', 'login', 'passwordHash', 'firstName', 'lastName', 'role', 'employee'],
    });
  }

  async update(id: number, updateDto: UpdateUserDto) {
    const user = await this.findOne(id);

    const { password, roleId, employeeId, ...rest } = updateDto;

    const updateData: any = { ...rest };

    if (password) {
      updateData.passwordHash = await argon2.hash(password);
    }

    if (roleId) updateData.role = { id: roleId };
    if (employeeId) updateData.employee = { id: employeeId };

    this.repo.merge(user, updateData);

    const savedUser = await this.repo.save(user);
    const { passwordHash: _, ...result } = savedUser;
    return result;
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    await this.repo.softRemove(user);
    return { message: `User #${id} successfully soft-removed` };
  }

  async softRemoveByEmployee(employeeId: number) {
    console.log(`Searching users for employeeId: ${employeeId}`);
    const users = await this.repo.find({
      where: { 
        employee: { id: employeeId }, 
      },
      withDeleted: true
    });
    
    console.log(`Found users: ${users.length}`);
    if (users.length > 0) {
      await this.repo.softRemove(users);
      return { 
        message: `Access for ${users.length} user(s) linked to employee #${employeeId} has been deactivated` 
      };
    }
    
    return { message: `No active users found for employee #${employeeId}` };
  }

  async restoreByEmployee(employeeId: number) {
    const user = await this.repo.findOne({
      where: { 
        employee: { id: employeeId },
        deletedAt: Not(IsNull()) 
      },
      withDeleted: true,
    });

    if (user) {
      await this.repo.recover(user);
      return { 
        message: `User account for employee #${employeeId} has been successfully restored` 
      };
    }

    return { message: `No deactivated account found for employee #${employeeId}` };
  }
}