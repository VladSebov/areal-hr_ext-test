import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsInt,
    MinLength,
    MaxLength
} from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    lastName: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    firstName: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    middleName?: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(100)
    login: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @IsInt()
    @IsNotEmpty()
    roleId: number;

    @IsInt()
    @IsNotEmpty()
    employeeId: number;
}