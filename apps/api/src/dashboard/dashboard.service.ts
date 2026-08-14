import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class DashboardService {
  constructor(private readonly db: DatabaseService) {}

  async summary(userId: string) {
    const today = new Date().toISOString().slice(0, 10);
    const [
      activeStudents,
      teachers,
      rooms,
      todayLessons,
      overdue,
      collected,
      contracted,
      rented,
    ] = await Promise.all([
      this.db.queryOne<{ c: string }>(`select count(*)::text as c from students where user_id = $1 and status = 'active'`, [userId]),
      this.db.queryOne<{ c: string }>(`select count(*)::text as c from teachers where user_id = $1 and status = 'active'`, [userId]),
      this.db.queryOne<{ c: string }>(`select count(*)::text as c from rooms where user_id = $1`, [userId]),
      this.db.queryOne<{ c: string }>(`select count(*)::text as c from lessons where user_id = $1 and lesson_date = $2`, [userId, today]),
      this.db.queryOne<{ total: string }>(`select coalesce(sum(amount),0)::text as total from invoices where user_id = $1 and status in ('overdue','partial')`, [userId]),
      this.db.queryOne<{ total: string }>(`select coalesce(sum(amount),0)::text as total from invoices where user_id = $1 and status = 'paid' and paid_at >= date_trunc('month', current_date)`, [userId]),
      this.db.queryOne<{ total: string }>(`select coalesce(sum(monthly_fee),0)::text as total from enrollments where user_id = $1 and status = 'active'`, [userId]),
      this.db.queryOne<{ c: string }>(`select count(*)::text as c from instruments where user_id = $1 and status = 'rented'`, [userId]),
    ]);

    const schedule = await this.db.query(
      `select l.id, l.start_time, l.duration_min, l.instrument, l.status,
              s.name as student_name, t.name as teacher_name, r.name as room_name
       from lessons l
       join students s on s.id = l.student_id
       join teachers t on t.id = l.teacher_id
       left join rooms r on r.id = l.room_id
       where l.user_id = $1 and l.lesson_date = $2
       order by l.start_time`,
      [userId, today],
    );

    const collectedByMonth = await this.db.query(
      `select to_char(date_trunc('month', paid_at), 'YYYY-MM') as month, coalesce(sum(amount),0) as total
       from invoices where user_id = $1 and status = 'paid' and paid_at is not null
       group by 1 order by 1 desc limit 6`,
      [userId],
    );

    const recent = await this.db.query(
      `select 'invoice' as kind, number || ' · ' || period_label as title, created_at as at, status as meta,
              (select name from students s where s.id = i.student_id) as context
       from invoices i where user_id = $1
       union all
       select 'lesson', instrument, created_at, status,
              (select name from students s where s.id = l.student_id)
       from lessons l where user_id = $1
       order by at desc limit 8`,
      [userId],
    );

    const upcomingRecital = await this.db.queryOne(
      `select * from recitals where user_id = $1 and recital_date >= current_date and status <> 'cancelled'
       order by recital_date limit 1`,
      [userId],
    );

    return {
      kpis: {
        activeStudents: Number(activeStudents?.c ?? 0),
        teachers: Number(teachers?.c ?? 0),
        rooms: Number(rooms?.c ?? 0),
        todayLessons: Number(todayLessons?.c ?? 0),
        monthlyTuition: Number(contracted?.total ?? 0),
        collectedThisMonth: Number(collected?.total ?? 0),
        overdue: Number(overdue?.total ?? 0),
        rentedInstruments: Number(rented?.c ?? 0),
      },
      todaySchedule: schedule,
      collectedByMonth: collectedByMonth.map((r) => ({ month: String(r.month), total: Number(r.total) })).reverse(),
      recentActivity: recent.map((r) => ({
        kind: r.kind,
        title: r.title,
        at: r.at,
        meta: r.meta,
        context: r.context,
      })),
      upcomingRecital,
      dbSource: this.db.source,
    };
  }
}
