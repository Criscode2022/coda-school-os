import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../database/database.service';
import { CreateInstrumentDto, UpdateInstrumentDto } from './instruments.dto';

const SELECT = `
  select i.*, s.name as student_name
  from instruments i
  left join students s on s.id = i.student_id
`;

@Injectable()
export class InstrumentsService {
  constructor(private readonly db: DatabaseService) {}

  list(userId: string) {
    return this.db.query(`${SELECT} where i.user_id = $1 order by i.type, i.name`, [userId]);
  }

  async get(userId: string, id: string) {
    const row = await this.db.queryOne(`${SELECT} where i.id = $1 and i.user_id = $2`, [id, userId]);
    if (!row) throw new NotFoundException('Instrument not found');
    return row;
  }

  async create(userId: string, dto: CreateInstrumentDto) {
    const id = randomUUID();
    await this.db.exec(
      `insert into instruments (id,user_id,name,type,serial,condition,status,monthly_rate,student_id,notes)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        id,
        userId,
        dto.name,
        dto.type ?? 'piano',
        dto.serial ?? '',
        dto.condition ?? 'good',
        dto.status ?? 'available',
        dto.monthlyRate ?? 0,
        dto.studentId || null,
        dto.notes ?? '',
      ],
    );
    return this.get(userId, id);
  }

  async update(userId: string, id: string, dto: UpdateInstrumentDto) {
    await this.get(userId, id);
    await this.db.exec(
      `update instruments set
         name = coalesce($3, name),
         type = coalesce($4, type),
         serial = coalesce($5, serial),
         condition = coalesce($6, condition),
         status = coalesce($7, status),
         monthly_rate = coalesce($8, monthly_rate),
         student_id = $9,
         notes = coalesce($10, notes)
       where id = $1 and user_id = $2`,
      [
        id,
        userId,
        dto.name ?? null,
        dto.type ?? null,
        dto.serial ?? null,
        dto.condition ?? null,
        dto.status ?? null,
        dto.monthlyRate ?? null,
        dto.studentId === undefined ? (await this.get(userId, id)).student_id : dto.studentId || null,
        dto.notes ?? null,
      ],
    );
    return this.get(userId, id);
  }

  async remove(userId: string, id: string) {
    await this.get(userId, id);
    await this.db.exec(`delete from instruments where id = $1 and user_id = $2`, [id, userId]);
    return { ok: true };
  }
}
