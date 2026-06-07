import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsEnum(['Academic', 'Workshop', 'Social', 'Career', 'Sports'])
  category: string;

  @IsOptional()
  @IsString()
  visibility?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  locationType?: string;

  @IsString()
  location: string;

  @IsOptional()
  @IsInt()
  capacity?: number;

  @IsOptional()
  @IsDateString()
  registrationDeadline?: string;

  @IsOptional()
  @IsBoolean()
  requireApproval?: boolean;

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(['Academic', 'Workshop', 'Social', 'Career', 'Sports'])
  category?: string;

  @IsOptional()
  @IsString()
  visibility?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  locationType?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsInt()
  capacity?: number;

  @IsOptional()
  @IsDateString()
  registrationDeadline?: string;

  @IsOptional()
  @IsBoolean()
  requireApproval?: boolean;

  @IsOptional()
  @IsEnum(['active', 'draft', 'past', 'completed'])
  status?: string;
}
