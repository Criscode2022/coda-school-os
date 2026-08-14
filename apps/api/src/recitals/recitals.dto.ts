import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateRecitalDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  venue?: string;

  @IsString()
  recitalDate!: string;

  @IsOptional()
  @IsString()
  programNotes?: string;

  @IsOptional()
  @IsIn(['planned', 'confirmed', 'done', 'cancelled'])
  status?: string;
}

export class UpdateRecitalDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  venue?: string;

  @IsOptional()
  @IsString()
  recitalDate?: string;

  @IsOptional()
  @IsString()
  programNotes?: string;

  @IsOptional()
  @IsIn(['planned', 'confirmed', 'done', 'cancelled'])
  status?: string;
}

export class CreatePieceDto {
  @IsString()
  studentId!: string;

  @IsString()
  piece!: string;

  @IsOptional()
  @IsString()
  composer?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}
