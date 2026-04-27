import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './models/user.model';
import {Role} from "../roles/models/role.model";
import {Employee} from "../employees/models/employee.model";
import {ConfigModule} from "@nestjs/config";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Employee]),
    ConfigModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}