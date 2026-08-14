import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

const STATUSES = ['draft', 'sent', 'paid', 'overdue', 'partial'] as const;

export class CreateInvoiceDto {
  @IsString()
  studentId!: string;

  @IsOptional()
  @IsString()
  enrollmentId?: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsString()
  periodLabel!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsIn(STATUSES)
  status?: string;

  @IsString()
  dueDate!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateInvoiceDto {
  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  enrollmentId?: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  periodLabel?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsIn(STATUSES)
  status?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
