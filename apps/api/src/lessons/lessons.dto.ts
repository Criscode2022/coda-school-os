import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

const STATUSES = ['scheduled', 'completed', 'cancelled', 'no_show'] as const;

export class CreateLessonDto {
  @IsString()
  studentId!: string;

  @IsString()
  teacherId!: string;

  @IsOptional()
  @IsString()
  roomId?: string;

  @IsOptional()
  @IsString()
  instrument?: string;

  @IsString()
  lessonDate!: string;

  @IsString()
  startTime!: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  durationMin?: number;

  @IsOptional()
  @IsIn(STATUSES)
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateLessonDto {
  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  teacherId?: string;

  @IsOptional()
  @IsString()
  roomId?: string;

  @IsOptional()
  @IsString()
  instrument?: string;

  @IsOptional()
  @IsString()
  lessonDate?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  durationMin?: number;

  @IsOptional()
  @IsIn(STATUSES)
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
