import {forwardRef, Module} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HrOperationsService } from './hr_operations.service';
import { HrOperationsController } from './hr_operations.controller';
import { HrOperation } from './models/hr_operation.model';
import { Employee } from '../employees/models/employee.model';
import { Department } from '../departments/models/department.model';
import { Position } from '../positions/models/position.model';
import {EmployeesModule} from "../employees/employees.module";
import {UsersModule} from "../users/users.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([HrOperation, Employee, Department, Position]),
    forwardRef(() => EmployeesModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [HrOperationsController],
  providers: [HrOperationsService],
  exports: [HrOperationsService],
})
export class HrOperationsModule {}