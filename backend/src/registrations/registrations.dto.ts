import { IsString, IsOptional, IsInt, IsEmail, IsNumber } from 'class-validator';

export class CreateRegistrationDto {
  @IsInt()
  eventId: number;

  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class QRScanDto {
  @IsNumber()
  eventId: number;

  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  department?: string;
}
