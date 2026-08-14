import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

const LEVELS = ['beginner', 'intermediate', 'advanced', 'diploma'] as const;
const STATUSES = ['active', 'paused', 'alumni'] as const;

export class CreateStudentDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  birthdate?: string;

  @IsOptional()
  @IsString()
  guardianName?: string;

  @IsOptional()
  @IsString()
  guardianPhone?: string;

  @IsOptional()
  @IsIn(LEVELS)
  level?: string;

  @IsOptional()
  @IsString()
  primaryInstrument?: string;

  @IsOptional()
  @IsIn(STATUSES)
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  birthdate?: string;

  @IsOptional()
  @IsString()
  guardianName?: string;

  @IsOptional()
  @IsString()
  guardianPhone?: string;

  @IsOptional()
  @IsIn(LEVELS)
  level?: string;

  @IsOptional()
  @IsString()
  primaryInstrument?: string;

  @IsOptional()
  @IsIn(STATUSES)
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
