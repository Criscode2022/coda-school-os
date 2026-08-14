import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../database/database.service';
import { CreateRoomDto, UpdateRoomDto } from './rooms.dto';

@Injectable()
export class RoomsService {
  constructor(private readonly db: DatabaseService) {}

  list(userId: string) {
    return this.db.query(`select * from rooms where user_id = $1 order by name`, [userId]);
  }

  async get(userId: string, id: string) {
    const row = await this.db.queryOne(`select * from rooms where id = $1 and user_id = $2`, [id, userId]);
    if (!row) throw new NotFoundException('Room not found');
    return row;
  }

  async create(userId: string, dto: CreateRoomDto) {
    const id = randomUUID();
    await this.db.exec(
      `insert into rooms (id,user_id,name,capacity,has_piano,notes) values ($1,$2,$3,$4,$5,$6)`,
      [id, userId, dto.name, dto.capacity ?? 2, dto.hasPiano ?? false, dto.notes ?? ''],
    );
    return this.get(userId, id);
  }

  async update(userId: string, id: string, dto: UpdateRoomDto) {
    await this.get(userId, id);
    await this.db.exec(
      `update rooms set
         name = coalesce($3, name),
         capacity = coalesce($4, capacity),
         has_piano = coalesce($5, has_piano),
         notes = coalesce($6, notes)
       where id = $1 and user_id = $2`,
      [id, userId, dto.name ?? null, dto.capacity ?? null, dto.hasPiano ?? null, dto.notes ?? null],
    );
    return this.get(userId, id);
  }

  async remove(userId: string, id: string) {
    await this.get(userId, id);
    await this.db.exec(`delete from rooms where id = $1 and user_id = $2`, [id, userId]);
    return { ok: true };
  }
}
