import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsDateString,
    Length,
    MaxLength,
    IsInt
} from 'class-validator';

export class CreateEmployeeDto {
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

    @IsDateString() // (YYYY-MM-DD)
    @IsNotEmpty()
    birthDate: string;

    @IsString()
    @IsNotEmpty()
    @Length(4, 4)
    passportSeries: string;

    @IsString()
    @IsNotEmpty()
    @Length(6, 6)
    passportNumber: string;

    @IsNotEmpty()
    @IsDateString()
    passportDate?: string;

    @IsString()
    @IsNotEmpty()
    @Length(6, 6)
    passportCode: string;

    @IsString()
    @IsNotEmpty()
    passportPlace: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    registrationRegion: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    registrationLocality: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    registrationStreet: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(10)
    registrationHouse: string;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    registrationHousing?: string;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    registrationApartment?: string;
}