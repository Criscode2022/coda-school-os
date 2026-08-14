import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../database/database.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './invoices.dto';

const SELECT = `
  select i.*, s.name as student_name
  from invoices i
  join students s on s.id = i.student_id
`;

@Injectable()
export class InvoicesService {
  constructor(private readonly db: DatabaseService) {}

  list(userId: string, status?: string) {
    const clauses = ['i.user_id = $1'];
    const params: unknown[] = [userId];
    if (status) {
      params.push(status);
      clauses.push(`i.status = $${params.length}`);
    }
    return this.db.query(`${SELECT} where ${clauses.join(' and ')} order by i.due_date desc`, params);
  }

  async get(userId: string, id: string) {
    const row = await this.db.queryOne(`${SELECT} where i.id = $1 and i.user_id = $2`, [id, userId]);
    if (!row) throw new NotFoundException('Invoice not found');
    return row;
  }

  async create(userId: string, dto: CreateInvoiceDto) {
    const id = randomUUID();
    const number = dto.number || `CM-${Date.now().toString().slice(-6)}`;
    await this.db.exec(
      `insert into invoices (id,user_id,student_id,enrollment_id,number,period_label,amount,status,due_date,notes,paid_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        id,
        userId,
        dto.studentId,
        dto.enrollmentId || null,
        number,
        dto.periodLabel,
        dto.amount,
        dto.status ?? 'sent',
        dto.dueDate,
        dto.notes ?? '',
        (dto.status ?? 'sent') === 'paid' ? new Date().toISOString() : null,
      ],
    );
    return this.get(userId, id);
  }

  async update(userId: string, id: string, dto: UpdateInvoiceDto) {
    const current = await this.get(userId, id);
    const nextStatus = dto.status ?? String(current.status);
    const paidAt = nextStatus === 'paid' ? new Date().toISOString() : null;
    await this.db.exec(
      `update invoices set
         student_id = coalesce($3, student_id),
         enrollment_id = coalesce($4, enrollment_id),
         number = coalesce($5, number),
         period_label = coalesce($6, period_label),
         amount = coalesce($7, amount),
         status = coalesce($8, status),
         due_date = coalesce($9, due_date),
         notes = coalesce($10, notes),
         paid_at = $11
       where id = $1 and user_id = $2`,
      [
        id,
        userId,
        dto.studentId ?? null,
        dto.enrollmentId ?? null,
        dto.number ?? null,
        dto.periodLabel ?? null,
        dto.amount ?? null,
        dto.status ?? null,
        dto.dueDate ?? null,
        dto.notes ?? null,
        paidAt,
      ],
    );
    return this.get(userId, id);
  }

  async remove(userId: string, id: string) {
    await this.get(userId, id);
    await this.db.exec(`delete from invoices where id = $1 and user_id = $2`, [id, userId]);
    return { ok: true };
  }

  async generateMonth(userId: string) {
    const now = new Date();
    const period = now.toLocaleString('en-GB', { month: 'short', year: 'numeric' });
    const existing = await this.db.queryOne<{ c: string }>(
      `select count(*)::text as c from invoices where user_id = $1 and period_label = $2`,
      [userId, period],
    );
    if (existing && Number(existing.c) > 0) return { created: 0, period };

    const enrollments = await this.db.query<{ id: string; student_id: string; monthly_fee: string }>(
      `select id, student_id, monthly_fee from enrollments where user_id = $1 and status = 'active'`,
      [userId],
    );
    const due = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-05`;
    let created = 0;
    for (const row of enrollments) {
      await this.db.exec(
        `insert into invoices (id,user_id,student_id,enrollment_id,number,period_label,amount,status,due_date)
         values ($1,$2,$3,$4,$5,$6,$7,'sent',$8)`,
        [
          randomUUID(),
          userId,
          row.student_id,
          row.id,
          `CM-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(created + 1).padStart(3, '0')}`,
          period,
          Number(row.monthly_fee),
          due,
        ],
      );
      created += 1;
    }
    return { created, period };
  }
}
