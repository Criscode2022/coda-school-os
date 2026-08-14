import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

const PLANS = ['weekly_30', 'weekly_45', 'weekly_60', 'monthly_unlimited'] as const;

export class CreateEnrollmentDto {
  @IsString()
  studentId!: string;

  @IsOptional()
  @IsIn(PLANS)
  plan?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyFee?: number;

  @IsString()
  startDate!: string;

  @IsOptional()
  @IsIn(['active', 'paused', 'ended'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateEnrollmentDto {
  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsIn(PLANS)
  plan?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyFee?: number;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsIn(['active', 'paused', 'ended'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
