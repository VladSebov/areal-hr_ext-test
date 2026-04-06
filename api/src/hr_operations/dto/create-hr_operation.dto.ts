import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    IsString,
    MaxLength
} from 'class-validator';

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
    salary?: number;

    @IsString()
    @IsOptional()
    @MaxLength(50)
    operationType?: string;
}