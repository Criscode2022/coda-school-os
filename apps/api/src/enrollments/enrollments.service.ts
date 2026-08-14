import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../database/database.service';
import { CreateEnrollmentDto, UpdateEnrollmentDto } from './enrollments.dto';

const SELECT = `
  select e.*, s.name as student_name
  from enrollments e
  join students s on s.id = e.student_id
`;

@Injectable()
export class EnrollmentsService {
  constructor(private readonly db: DatabaseService) {}

  list(userId: string) {
    return this.db.query(`${SELECT} where e.user_id = $1 order by s.name`, [userId]);
  }

  async get(userId: string, id: string) {
    const row = await this.db.queryOne(`${SELECT} where e.id = $1 and e.user_id = $2`, [id, userId]);
    if (!row) throw new NotFoundException('Enrollment not found');
    return row;
  }

  async create(userId: string, dto: CreateEnrollmentDto) {
    const id = randomUUID();
    await this.db.exec(
      `insert into enrollments (id,user_id,student_id,plan,monthly_fee,start_date,status,notes)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [id, userId, dto.studentId, dto.plan ?? 'weekly_45', dto.monthlyFee ?? 0, dto.startDate, dto.status ?? 'active', dto.notes ?? ''],
    );
    return this.get(userId, id);
  }

  async update(userId: string, id: string, dto: UpdateEnrollmentDto) {
    await this.get(userId, id);
    await this.db.exec(
      `update enrollments set
         student_id = coalesce($3, student_id),
         plan = coalesce($4, plan),
         monthly_fee = coalesce($5, monthly_fee),
         start_date = coalesce($6, start_date),
         status = coalesce($7, status),
         notes = coalesce($8, notes)
       where id = $1 and user_id = $2`,
      [id, userId, dto.studentId ?? null, dto.plan ?? null, dto.monthlyFee ?? null, dto.startDate ?? null, dto.status ?? null, dto.notes ?? null],
    );
    return this.get(userId, id);
  }

  async remove(userId: string, id: string) {
    await this.get(userId, id);
    await this.db.exec(`delete from enrollments where id = $1 and user_id = $2`, [id, userId]);
    return { ok: true };
  }
}
