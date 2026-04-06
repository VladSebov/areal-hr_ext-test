import { IsString, IsNotEmpty, IsOptional, IsInt, MinLength, MaxLength } from 'class-validator';

export class CreateDepartmentDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(255)
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    comment?: string;

    @IsInt()
    @IsNotEmpty()
    organizationId: number;

    @IsOptional()
    @IsInt()
    parentId?: number;
}