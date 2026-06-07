import { IsString, IsOptional, IsInt, IsEmail } from 'class-validator';

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
