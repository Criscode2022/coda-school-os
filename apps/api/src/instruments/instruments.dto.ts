import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

const TYPES = ['piano', 'violin', 'viola', 'cello', 'guitar', 'flute', 'clarinet', 'saxophone', 'trumpet', 'drums', 'other'] as const;
const STATUSES = ['available', 'rented', 'repair'] as const;

export class CreateInstrumentDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsIn(TYPES)
  type?: string;

  @IsOptional()
  @IsString()
  serial?: string;

  @IsOptional()
  @IsIn(['excellent', 'good', 'fair', 'poor'])
  condition?: string;

  @IsOptional()
  @IsIn(STATUSES)
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyRate?: number;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateInstrumentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(TYPES)
  type?: string;

  @IsOptional()
  @IsString()
  serial?: string;

  @IsOptional()
  @IsIn(['excellent', 'good', 'fair', 'poor'])
  condition?: string;

  @IsOptional()
  @IsIn(STATUSES)
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyRate?: number;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
