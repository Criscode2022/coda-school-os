import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { PGlite } from '@electric-sql/pglite';
import { Pool, type QueryResultRow } from 'pg';
import { randomUUID } from 'crypto';

type QueryResult<T> = { rows: T[]; rowCount: number | null };

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool | null = null;
  private pglite: PGlite | null = null;
  private mode: 'neon' | 'pglite' = 'pglite';
  public source: 'neon' | 'pglite' = 'pglite';

  async onModuleInit() {
    const url = process.env.DATABASE_URL?.trim();
    if (url) {
      this.pool = new Pool({
        connectionString: url,
        ssl: url.includes('localhost') ? undefined : { rejectUnauthorized: false },
        max: 10,
      });
      this.mode = 'neon';
      this.source = 'neon';
      this.logger.log('Connected to Neon / Postgres via DATABASE_URL');
    } else {
      this.pglite = new PGlite();
      this.mode = 'pglite';
      this.source = 'pglite';
      this.logger.log('DATABASE_URL unset — using embedded PGLite');
    }
    await this.migrate();
    await this.seedIfEmpty();
  }

  async onModuleDestroy() {
    await this.pool?.end();
    await this.pglite?.close();
  }

  private async rawQuery<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params: unknown[] = [],
  ): Promise<QueryResult<T>> {
    if (this.mode === 'neon' && this.pool) {
      const res = await this.pool.query<T>(text, params);
      return { rows: res.rows, rowCount: res.rowCount };
    }
    const res = await this.pglite!.query(text, params);
    return { rows: (res.rows as T[]) ?? [], rowCount: res.rows?.length ?? 0 };
  }

  async query<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []): Promise<T[]> {
    const res = await this.rawQuery<T>(text, params);
    return res.rows;
  }

  async queryOne<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []): Promise<T | null> {
    const rows = await this.query<T>(text, params);
    return rows[0] ?? null;
  }

  async exec(text: string, params: unknown[] = []): Promise<number> {
    const res = await this.rawQuery(text, params);
    return res.rowCount ?? 0;
  }

  private async migrate() {
    const statements = [
      `create table if not exists users (
        id text primary key,
        email text not null unique,
        password_hash text not null,
        name text not null,
        company text not null default '',
        phone text not null default '',
        tax_id text not null default '',
        currency text not null default 'EUR',
        created_at timestamptz not null default now()
      )`,
      `create table if not exists students (
        id text primary key,
        user_id text not null references users(id) on delete cascade,
        name text not null,
        email text not null default '',
        phone text not null default '',
        birthdate date,
        guardian_name text not null default '',
        guardian_phone text not null default '',
        level text not null default 'beginner',
        primary_instrument text not null default 'piano',
        status text not null default 'active',
        notes text not null default '',
        created_at timestamptz not null default now()
      )`,
      `create index if not exists students_user_id_idx on students(user_id)`,
      `create table if not exists teachers (
        id text primary key,
        user_id text not null references users(id) on delete cascade,
        name text not null,
        email text not null default '',
        phone text not null default '',
        instruments text not null default '',
        hourly_rate numeric(10,2) not null default 0,
        status text not null default 'active',
        bio text not null default '',
        created_at timestamptz not null default now()
      )`,
      `create index if not exists teachers_user_id_idx on teachers(user_id)`,
      `create table if not exists rooms (
        id text primary key,
        user_id text not null references users(id) on delete cascade,
        name text not null,
        capacity integer not null default 2,
        has_piano boolean not null default false,
        notes text not null default '',
        created_at timestamptz not null default now()
      )`,
      `create index if not exists rooms_user_id_idx on rooms(user_id)`,
      `create table if not exists lessons (
        id text primary key,
        user_id text not null references users(id) on delete cascade,
        student_id text not null references students(id) on delete cascade,
        teacher_id text not null references teachers(id) on delete cascade,
        room_id text references rooms(id) on delete set null,
        instrument text not null default '',
        lesson_date date not null,
        start_time text not null,
        duration_min integer not null default 45,
        status text not null default 'scheduled',
        notes text not null default '',
        created_at timestamptz not null default now()
      )`,
      `create index if not exists lessons_user_date_idx on lessons(user_id, lesson_date)`,
      `create table if not exists enrollments (
        id text primary key,
        user_id text not null references users(id) on delete cascade,
        student_id text not null references students(id) on delete cascade,
        plan text not null default 'weekly_45',
        monthly_fee numeric(10,2) not null default 0,
        start_date date not null,
        status text not null default 'active',
        notes text not null default '',
        created_at timestamptz not null default now()
      )`,
      `create index if not exists enrollments_user_id_idx on enrollments(user_id)`,
      `create table if not exists invoices (
        id text primary key,
        user_id text not null references users(id) on delete cascade,
        student_id text not null references students(id) on delete cascade,
        enrollment_id text references enrollments(id) on delete set null,
        number text not null,
        period_label text not null,
        amount numeric(10,2) not null default 0,
        status text not null default 'sent',
        due_date date not null,
        paid_at timestamptz,
        notes text not null default '',
        created_at timestamptz not null default now()
      )`,
      `create index if not exists invoices_user_id_idx on invoices(user_id)`,
      `create table if not exists instruments (
        id text primary key,
        user_id text not null references users(id) on delete cascade,
        name text not null,
        type text not null default 'piano',
        serial text not null default '',
        condition text not null default 'good',
        status text not null default 'available',
        monthly_rate numeric(10,2) not null default 0,
        student_id text references students(id) on delete set null,
        notes text not null default '',
        created_at timestamptz not null default now()
      )`,
      `create index if not exists instruments_user_id_idx on instruments(user_id)`,
      `create table if not exists recitals (
        id text primary key,
        user_id text not null references users(id) on delete cascade,
        title text not null,
        venue text not null default '',
        recital_date date not null,
        program_notes text not null default '',
        status text not null default 'planned',
        created_at timestamptz not null default now()
      )`,
      `create table if not exists recital_pieces (
        id text primary key,
        user_id text not null references users(id) on delete cascade,
        recital_id text not null references recitals(id) on delete cascade,
        student_id text not null references students(id) on delete cascade,
        piece text not null,
        composer text not null default '',
        order_index integer not null default 0
      )`,
    ];
    for (const sql of statements) await this.exec(sql);
    this.logger.log('Migrations applied');
  }

  private async seedIfEmpty() {
    const existing = await this.queryOne<{ c: string }>(`select count(*)::text as c from users`);
    if (existing && Number(existing.c) > 0) return;

    const bcrypt = await import('bcrypt');
    const userId = randomUUID();
    const passwordHash = await bcrypt.hash('demo1234', 10);
    await this.exec(
      `insert into users (id, email, password_hash, name, company, phone, tax_id, currency)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [userId, 'demo@coda.school', passwordHash, 'Elena March', 'Conservatori Mar', '+34 963 220 114', 'G98765432', 'EUR'],
    );

    const s1 = randomUUID();
    const s2 = randomUUID();
    const s3 = randomUUID();
    const s4 = randomUUID();
    const s5 = randomUUID();
    const s6 = randomUUID();
    const s7 = randomUUID();
    const s8 = randomUUID();
    const students: [string, string, string, string, string, string, string, string, string, string][] = [
      [s1, 'Clara Vives', 'clara.vives@email.com', '+34 600 221 118', '2008-04-12', 'Núria Vives', '+34 600 221 100', 'advanced', 'piano', 'active'],
      [s2, 'Nico Serra', 'nico.serra@email.com', '+34 611 334 220', '2012-09-03', 'Pau Serra', '+34 611 334 200', 'intermediate', 'violin', 'active'],
      [s3, 'Aina Puig', 'aina.puig@email.com', '+34 622 445 331', '2015-01-22', 'Marta Puig', '+34 622 445 300', 'beginner', 'cello', 'active'],
      [s4, 'Hugo Ferrer', 'hugo.ferrer@email.com', '+34 633 556 442', '2010-11-08', 'Laura Ferrer', '+34 633 556 400', 'intermediate', 'guitar', 'active'],
      [s5, 'Laia Bosch', 'laia.bosch@email.com', '+34 644 667 553', '2007-06-19', 'Joan Bosch', '+34 644 667 500', 'advanced', 'flute', 'active'],
      [s6, 'Marc Soler', 'marc.soler@email.com', '+34 655 778 664', '2014-03-30', 'Eva Soler', '+34 655 778 600', 'beginner', 'drums', 'active'],
      [s7, 'Sofia Reig', 'sofia.reig@email.com', '+34 666 889 775', '2011-07-14', 'Carles Reig', '+34 666 889 700', 'intermediate', 'piano', 'active'],
      [s8, 'Pau Navarro', 'pau.navarro@email.com', '+34 677 990 886', '2013-12-02', 'Irene Navarro', '+34 677 990 800', 'beginner', 'clarinet', 'paused'],
    ];
    for (const [id, name, email, phone, birth, gName, gPhone, level, inst, status] of students) {
      await this.exec(
        `insert into students (id,user_id,name,email,phone,birthdate,guardian_name,guardian_phone,level,primary_instrument,status)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [id, userId, name, email, phone, birth, gName, gPhone, level, inst, status],
      );
    }

    const t1 = randomUUID();
    const t2 = randomUUID();
    const t3 = randomUUID();
    const t4 = randomUUID();
    const teachers: [string, string, string, string, string, number, string][] = [
      [t1, 'Isabel Costa', 'isabel@coda.school', '+34 610 101 201', 'piano, theory', 42, 'Head of keyboard. Conservatori del Liceu.'],
      [t2, 'Jordi Palau', 'jordi@coda.school', '+34 610 101 202', 'violin, viola, cello', 38, 'Orquestra de València, strings faculty.'],
      [t3, 'Marta Llorens', 'marta@coda.school', '+34 610 101 203', 'flute, clarinet, saxophone', 40, 'Woodwinds and chamber coach.'],
      [t4, 'Toni Riera', 'toni@coda.school', '+34 610 101 204', 'guitar, drums, bass', 36, 'Contemporary department lead.'],
    ];
    for (const [id, name, email, phone, instruments, rate, bio] of teachers) {
      await this.exec(
        `insert into teachers (id,user_id,name,email,phone,instruments,hourly_rate,status,bio)
         values ($1,$2,$3,$4,$5,$6,$7,'active',$8)`,
        [id, userId, name, email, phone, instruments, rate, bio],
      );
    }

    const r1 = randomUUID();
    const r2 = randomUUID();
    const r3 = randomUUID();
    const r4 = randomUUID();
    const rooms: [string, string, number, boolean, string][] = [
      [r1, 'Sala A', 2, true, 'Steinway B. Street side, quieter after 18:00.'],
      [r2, 'Sala B', 2, true, 'Yamaha U3 upright. Best for beginners.'],
      [r3, 'Ensemble', 8, true, 'Chamber and theory. Folding chairs stacked east wall.'],
      [r4, 'Percussion', 3, false, 'Kit, congas, and a practice pad wall.'],
    ];
    for (const [id, name, capacity, piano, notes] of rooms) {
      await this.exec(
        `insert into rooms (id,user_id,name,capacity,has_piano,notes) values ($1,$2,$3,$4,$5,$6)`,
        [id, userId, name, capacity, piano, notes],
      );
    }

    const today = new Date();
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    const shift = (days: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + days);
      return iso(d);
    };

    const lessons: [string, string, string, string, string, string, number, string][] = [
      [s1, t1, r1, 'piano', shift(0), '16:00', 60, 'scheduled'],
      [s7, t1, r2, 'piano', shift(0), '17:15', 45, 'scheduled'],
      [s2, t2, r3, 'violin', shift(0), '17:00', 45, 'scheduled'],
      [s5, t3, r3, 'flute', shift(0), '18:00', 45, 'scheduled'],
      [s4, t4, r4, 'guitar', shift(0), '18:30', 45, 'scheduled'],
      [s3, t2, r3, 'cello', shift(1), '16:30', 30, 'scheduled'],
      [s6, t4, r4, 'drums', shift(1), '17:30', 30, 'scheduled'],
      [s1, t1, r1, 'piano', shift(-2), '16:00', 60, 'completed'],
      [s2, t2, r3, 'violin', shift(-2), '17:00', 45, 'completed'],
      [s8, t3, r2, 'clarinet', shift(-3), '16:00', 30, 'cancelled'],
      [s4, t4, r4, 'guitar', shift(-1), '18:30', 45, 'no_show'],
      [s5, t3, r3, 'flute', shift(3), '18:00', 45, 'scheduled'],
      [s7, t1, r2, 'piano', shift(3), '17:15', 45, 'scheduled'],
    ];
    for (const [studentId, teacherId, roomId, instrument, date, time, dur, status] of lessons) {
      await this.exec(
        `insert into lessons (id,user_id,student_id,teacher_id,room_id,instrument,lesson_date,start_time,duration_min,status)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [randomUUID(), userId, studentId, teacherId, roomId, instrument, date, time, dur, status],
      );
    }

    const e1 = randomUUID();
    const e2 = randomUUID();
    const e3 = randomUUID();
    const e4 = randomUUID();
    const e5 = randomUUID();
    const e6 = randomUUID();
    const e7 = randomUUID();
    const enrollments: [string, string, string, number, string, string][] = [
      [e1, s1, 'weekly_60', 128, '2024-09-02', 'active'],
      [e2, s2, 'weekly_45', 96, '2025-01-13', 'active'],
      [e3, s3, 'weekly_30', 72, '2025-10-06', 'active'],
      [e4, s4, 'weekly_45', 90, '2024-10-01', 'active'],
      [e5, s5, 'weekly_45', 102, '2023-09-11', 'active'],
      [e6, s6, 'weekly_30', 68, '2026-02-03', 'active'],
      [e7, s7, 'weekly_45', 96, '2025-03-17', 'active'],
    ];
    for (const [id, studentId, plan, fee, start, status] of enrollments) {
      await this.exec(
        `insert into enrollments (id,user_id,student_id,plan,monthly_fee,start_date,status)
         values ($1,$2,$3,$4,$5,$6,$7)`,
        [id, userId, studentId, plan, fee, start, status],
      );
    }

    const inv = async (
      studentId: string,
      enrollmentId: string,
      number: string,
      period: string,
      amount: number,
      status: string,
      due: string,
      paidDaysAgo?: number,
    ) => {
      await this.exec(
        `insert into invoices (id,user_id,student_id,enrollment_id,number,period_label,amount,status,due_date,paid_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          randomUUID(),
          userId,
          studentId,
          enrollmentId,
          number,
          period,
          amount,
          status,
          due,
          paidDaysAgo != null ? new Date(Date.now() - paidDaysAgo * 86400000).toISOString() : null,
        ],
      );
    };
    await inv(s1, e1, 'CM-2026-071', 'Jul 2026', 128, 'paid', '2026-07-05', 32);
    await inv(s1, e1, 'CM-2026-081', 'Aug 2026', 128, 'sent', '2026-08-05');
    await inv(s2, e2, 'CM-2026-072', 'Jul 2026', 96, 'paid', '2026-07-05', 28);
    await inv(s2, e2, 'CM-2026-082', 'Aug 2026', 96, 'overdue', '2026-08-05');
    await inv(s3, e3, 'CM-2026-083', 'Aug 2026', 72, 'paid', '2026-08-05', 4);
    await inv(s4, e4, 'CM-2026-084', 'Aug 2026', 90, 'overdue', '2026-08-05');
    await inv(s5, e5, 'CM-2026-075', 'Jul 2026', 102, 'paid', '2026-07-05', 35);
    await inv(s5, e5, 'CM-2026-085', 'Aug 2026', 102, 'paid', '2026-08-05', 6);
    await inv(s6, e6, 'CM-2026-086', 'Aug 2026', 68, 'sent', '2026-08-10');
    await inv(s7, e7, 'CM-2026-087', 'Aug 2026', 96, 'partial', '2026-08-05');

    const instruments: [string, string, string, string, string, number, string | null][] = [
      ['Yamaha U1', 'piano', 'U1-44821', 'good', 'rented', 55, s7],
      ['Stentor II', 'cello', 'ST-1902', 'good', 'rented', 28, s3],
      ['Yamaha C40', 'guitar', 'C40-7711', 'fair', 'available', 12, null],
      ['Buffet Prodige', 'clarinet', 'BP-3301', 'excellent', 'available', 22, null],
      ['Pearl Export', 'drums', 'PX-12', 'good', 'repair', 0, null],
      ['Yamaha V5', 'violin', 'V5-8820', 'good', 'rented', 18, s2],
    ];
    for (const [name, type, serial, condition, status, rate, studentId] of instruments) {
      await this.exec(
        `insert into instruments (id,user_id,name,type,serial,condition,status,monthly_rate,student_id)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [randomUUID(), userId, name, type, serial, condition, status, rate, studentId],
      );
    }

    const recId = randomUUID();
    await this.exec(
      `insert into recitals (id,user_id,title,venue,recital_date,program_notes,status)
       values ($1,$2,$3,$4,$5,$6,$7)`,
      [
        recId,
        userId,
        'Tardor al Mar',
        'Sala Martínez — Conservatori Mar',
        '2026-09-20',
        'Autumn studio recital. Families arrive 17:30. No flash photography during Debussy.',
        'planned',
      ],
    );
    const pieces: [string, string, string, number][] = [
      [s3, 'Minuet in G', 'Bach', 1],
      [s7, 'Arabesque No. 1', 'Debussy', 2],
      [s2, 'Méditation', 'Massenet', 3],
      [s5, 'Syrinx', 'Debussy', 4],
      [s1, 'Nocturne Op. 9 No. 2', 'Chopin', 5],
      [s4, 'Recuerdos de la Alhambra (excerpt)', 'Tárrega', 6],
    ];
    for (const [studentId, piece, composer, order] of pieces) {
      await this.exec(
        `insert into recital_pieces (id,user_id,recital_id,student_id,piece,composer,order_index)
         values ($1,$2,$3,$4,$5,$6,$7)`,
        [randomUUID(), userId, recId, studentId, piece, composer, order],
      );
    }

    this.logger.log('Seeded demo account demo@coda.school / demo1234');
  }
}
