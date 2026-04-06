import { IsString, IsNotEmpty, IsInt, IsPositive, MaxLength } from 'class-validator';

export class CreateFileDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    bucketName: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    objectKey: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    mimeType: string;

    @IsInt()
    @IsPositive()
    fileSize: number;
}