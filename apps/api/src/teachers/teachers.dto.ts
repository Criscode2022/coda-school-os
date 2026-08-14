import { IsEmail, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateTeacherDto {
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
  instruments?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @IsOptional()
  @IsIn(['active', 'on_leave'])
  status?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}

export class UpdateTeacherDto {
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
  instruments?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @IsOptional()
  @IsIn(['active', 'on_leave'])
  status?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}
