import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../database/database.service';
import { CreateLessonDto, UpdateLessonDto } from './lessons.dto';

const SELECT = `
  select l.*,
         s.name as student_name,
         t.name as teacher_name,
         r.name as room_name
  from lessons l
  join students s on s.id = l.student_id
  join teachers t on t.id = l.teacher_id
  left join rooms r on r.id = l.room_id
`;

@Injectable()
export class LessonsService {
  constructor(private readonly db: DatabaseService) {}

  list(userId: string, from?: string, to?: string, status?: string) {
    const clauses = ['l.user_id = $1'];
    const params: unknown[] = [userId];
    if (from) {
      params.push(from);
      clauses.push(`l.lesson_date >= $${params.length}`);
    }
    if (to) {
      params.push(to);
      clauses.push(`l.lesson_date <= $${params.length}`);
    }
    if (status) {
      params.push(status);
      clauses.push(`l.status = $${params.length}`);
    }
    return this.db.query(
      `${SELECT} where ${clauses.join(' and ')} order by l.lesson_date, l.start_time`,
      params,
    );
  }

  async get(userId: string, id: string) {
    const row = await this.db.queryOne(`${SELECT} where l.id = $1 and l.user_id = $2`, [id, userId]);
    if (!row) throw new NotFoundException('Lesson not found');
    return row;
  }

  async create(userId: string, dto: CreateLessonDto) {
    const id = randomUUID();
    await this.db.exec(
      `insert into lessons (id,user_id,student_id,teacher_id,room_id,instrument,lesson_date,start_time,duration_min,status,notes)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        id,
        userId,
        dto.studentId,
        dto.teacherId,
        dto.roomId || null,
        dto.instrument ?? '',
        dto.lessonDate,
        dto.startTime,
        dto.durationMin ?? 45,
        dto.status ?? 'scheduled',
        dto.notes ?? '',
      ],
    );
    return this.get(userId, id);
  }

  async update(userId: string, id: string, dto: UpdateLessonDto) {
    await this.get(userId, id);
    await this.db.exec(
      `update lessons set
         student_id = coalesce($3, student_id),
         teacher_id = coalesce($4, teacher_id),
         room_id = coalesce($5, room_id),
         instrument = coalesce($6, instrument),
         lesson_date = coalesce($7, lesson_date),
         start_time = coalesce($8, start_time),
         duration_min = coalesce($9, duration_min),
         status = coalesce($10, status),
         notes = coalesce($11, notes)
       where id = $1 and user_id = $2`,
      [
        id,
        userId,
        dto.studentId ?? null,
        dto.teacherId ?? null,
        dto.roomId ?? null,
        dto.instrument ?? null,
        dto.lessonDate ?? null,
        dto.startTime ?? null,
        dto.durationMin ?? null,
        dto.status ?? null,
        dto.notes ?? null,
      ],
    );
    return this.get(userId, id);
  }

  async remove(userId: string, id: string) {
    await this.get(userId, id);
    await this.db.exec(`delete from lessons where id = $1 and user_id = $2`, [id, userId]);
    return { ok: true };
  }
}
