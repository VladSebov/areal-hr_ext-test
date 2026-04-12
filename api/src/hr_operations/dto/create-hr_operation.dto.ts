import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    IsString,
    MaxLength
} from 'class-validator';
import {Type} from "class-transformer";

export class CreateHrOperationDto {
    @IsInt()
    @IsNotEmpty()
    employeeId: number;

    @IsInt()
    @IsNotEmpty()
    departmentId: number;

    @IsInt()
    @IsNotEmpty()
    positionId: number;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    salary?: number;

    @IsString()
    @IsOptional()
    @MaxLength(50)
    operationType?: string;
}