import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
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
    const existing = await this.repo.findOne({ where: { login: dto.login } });
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
    return await this.repo.find({
      where: {
        deletedAt: IsNull(),
      },
      relations: ['role', 'employee'],
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.repo.findOne({
      where: { id },
      relations: ['role', 'employee'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
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
}