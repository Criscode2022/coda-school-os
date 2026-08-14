import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../database/database.service';
import { CreateTeacherDto, UpdateTeacherDto } from './teachers.dto';

@Injectable()
export class TeachersService {
  constructor(private readonly db: DatabaseService) {}

  list(userId: string) {
    return this.db.query(`select * from teachers where user_id = $1 order by name`, [userId]);
  }

  async get(userId: string, id: string) {
    const row = await this.db.queryOne(`select * from teachers where id = $1 and user_id = $2`, [id, userId]);
    if (!row) throw new NotFoundException('Teacher not found');
    return row;
  }

  async create(userId: string, dto: CreateTeacherDto) {
    const id = randomUUID();
    await this.db.exec(
      `insert into teachers (id,user_id,name,email,phone,instruments,hourly_rate,status,bio)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [id, userId, dto.name, dto.email ?? '', dto.phone ?? '', dto.instruments ?? '', dto.hourlyRate ?? 0, dto.status ?? 'active', dto.bio ?? ''],
    );
    return this.get(userId, id);
  }

  async update(userId: string, id: string, dto: UpdateTeacherDto) {
    await this.get(userId, id);
    await this.db.exec(
      `update teachers set
         name = coalesce($3, name),
         email = coalesce($4, email),
         phone = coalesce($5, phone),
         instruments = coalesce($6, instruments),
         hourly_rate = coalesce($7, hourly_rate),
         status = coalesce($8, status),
         bio = coalesce($9, bio)
       where id = $1 and user_id = $2`,
      [id, userId, dto.name ?? null, dto.email ?? null, dto.phone ?? null, dto.instruments ?? null, dto.hourlyRate ?? null, dto.status ?? null, dto.bio ?? null],
    );
    return this.get(userId, id);
  }

  async remove(userId: string, id: string) {
    await this.get(userId, id);
    await this.db.exec(`delete from teachers where id = $1 and user_id = $2`, [id, userId]);
    return { ok: true };
  }
}
