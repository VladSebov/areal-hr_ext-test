import { IsInt, IsNotEmpty } from 'class-validator';

export class CreatePassportScanDto {
    @IsInt()
    @IsNotEmpty()
    employeeId: number;

    @IsInt()
    @IsNotEmpty()
    fileId: number;
}