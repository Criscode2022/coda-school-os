import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../database/database.service';
import { CreatePieceDto, CreateRecitalDto, UpdateRecitalDto } from './recitals.dto';

@Injectable()
export class RecitalsService {
  constructor(private readonly db: DatabaseService) {}

  async list(userId: string) {
    const recitals = await this.db.query(`select * from recitals where user_id = $1 order by recital_date`, [userId]);
    const pieces = await this.db.query(
      `select p.*, s.name as student_name
       from recital_pieces p
       join students s on s.id = p.student_id
       where p.user_id = $1
       order by p.order_index`,
      [userId],
    );
    return recitals.map((r) => ({
      ...r,
      pieces: pieces.filter((p) => p.recital_id === r.id),
    }));
  }

  async get(userId: string, id: string) {
    const row = await this.db.queryOne(`select * from recitals where id = $1 and user_id = $2`, [id, userId]);
    if (!row) throw new NotFoundException('Recital not found');
    const pieces = await this.db.query(
      `select p.*, s.name as student_name from recital_pieces p join students s on s.id = p.student_id
       where p.recital_id = $1 and p.user_id = $2 order by p.order_index`,
      [id, userId],
    );
    return { ...row, pieces };
  }

  async create(userId: string, dto: CreateRecitalDto) {
    const id = randomUUID();
    await this.db.exec(
      `insert into recitals (id,user_id,title,venue,recital_date,program_notes,status)
       values ($1,$2,$3,$4,$5,$6,$7)`,
      [id, userId, dto.title, dto.venue ?? '', dto.recitalDate, dto.programNotes ?? '', dto.status ?? 'planned'],
    );
    return this.get(userId, id);
  }

  async update(userId: string, id: string, dto: UpdateRecitalDto) {
    await this.get(userId, id);
    await this.db.exec(
      `update recitals set
         title = coalesce($3, title),
         venue = coalesce($4, venue),
         recital_date = coalesce($5, recital_date),
         program_notes = coalesce($6, program_notes),
         status = coalesce($7, status)
       where id = $1 and user_id = $2`,
      [id, userId, dto.title ?? null, dto.venue ?? null, dto.recitalDate ?? null, dto.programNotes ?? null, dto.status ?? null],
    );
    return this.get(userId, id);
  }

  async remove(userId: string, id: string) {
    await this.get(userId, id);
    await this.db.exec(`delete from recitals where id = $1 and user_id = $2`, [id, userId]);
    return { ok: true };
  }

  async addPiece(userId: string, recitalId: string, dto: CreatePieceDto) {
    await this.get(userId, recitalId);
    await this.db.exec(
      `insert into recital_pieces (id,user_id,recital_id,student_id,piece,composer,order_index)
       values ($1,$2,$3,$4,$5,$6,$7)`,
      [randomUUID(), userId, recitalId, dto.studentId, dto.piece, dto.composer ?? '', dto.orderIndex ?? 0],
    );
    return this.get(userId, recitalId);
  }

  async removePiece(userId: string, recitalId: string, pieceId: string) {
    await this.get(userId, recitalId);
    await this.db.exec(`delete from recital_pieces where id = $1 and recital_id = $2 and user_id = $3`, [
      pieceId,
      recitalId,
      userId,
    ]);
    return this.get(userId, recitalId);
  }
}
