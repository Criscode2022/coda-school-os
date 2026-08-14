import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../database/database.service';
import { CreateStudentDto, UpdateStudentDto } from './students.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly db: DatabaseService) {}

  list(userId: string, q?: string, status?: string) {
    const clauses = ['user_id = $1'];
    const params: unknown[] = [userId];
    if (status) {
      params.push(status);
      clauses.push(`status = $${params.length}`);
    }
    if (q?.trim()) {
      params.push(`%${q.trim().toLowerCase()}%`);
      clauses.push(`(lower(name) like $${params.length} or lower(primary_instrument) like $${params.length} or lower(email) like $${params.length})`);
    }
    return this.db.query(
      `select * from students where ${clauses.join(' and ')} order by name`,
      params,
    );
  }

  async get(userId: string, id: string) {
    const row = await this.db.queryOne(`select * from students where id = $1 and user_id = $2`, [id, userId]);
    if (!row) throw new NotFoundException('Student not found');
    return row;
  }

  async create(userId: string, dto: CreateStudentDto) {
    const id = randomUUID();
    await this.db.exec(
      `insert into students (id,user_id,name,email,phone,birthdate,guardian_name,guardian_phone,level,primary_instrument,status,notes)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        id,
        userId,
        dto.name,
        dto.email ?? '',
        dto.phone ?? '',
        dto.birthdate || null,
        dto.guardianName ?? '',
        dto.guardianPhone ?? '',
        dto.level ?? 'beginner',
        dto.primaryInstrument ?? 'piano',
        dto.status ?? 'active',
        dto.notes ?? '',
      ],
    );
    return this.get(userId, id);
  }

  async update(userId: string, id: string, dto: UpdateStudentDto) {
    await this.get(userId, id);
    await this.db.exec(
      `update students set
         name = coalesce($3, name),
         email = coalesce($4, email),
         phone = coalesce($5, phone),
         birthdate = coalesce($6, birthdate),
         guardian_name = coalesce($7, guardian_name),
         guardian_phone = coalesce($8, guardian_phone),
         level = coalesce($9, level),
         primary_instrument = coalesce($10, primary_instrument),
         status = coalesce($11, status),
         notes = coalesce($12, notes)
       where id = $1 and user_id = $2`,
      [
        id,
        userId,
        dto.name ?? null,
        dto.email ?? null,
        dto.phone ?? null,
        dto.birthdate ?? null,
        dto.guardianName ?? null,
        dto.guardianPhone ?? null,
        dto.level ?? null,
        dto.primaryInstrument ?? null,
        dto.status ?? null,
        dto.notes ?? null,
      ],
    );
    return this.get(userId, id);
  }

  async remove(userId: string, id: string) {
    await this.get(userId, id);
    await this.db.exec(`delete from students where id = $1 and user_id = $2`, [id, userId]);
    return { ok: true };
  }
}
