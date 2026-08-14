import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../database/database.service';
import { LoginDto, RegisterDto, UpdateProfileDto } from './auth.dto';

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  company: string;
  phone: string;
  tax_id: string;
  currency: string;
  created_at: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService,
  ) {}

  private publicUser(row: UserRow) {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      company: row.company,
      phone: row.phone,
      taxId: row.tax_id,
      currency: row.currency,
      createdAt: row.created_at,
    };
  }

  private sign(user: UserRow) {
    const accessToken = this.jwt.sign({ sub: user.id, email: user.email });
    return { accessToken, user: this.publicUser(user) };
  }

  async register(dto: RegisterDto) {
    const existing = await this.db.queryOne<UserRow>(
      `select id from users where lower(email) = lower($1)`,
      [dto.email],
    );
    if (existing) throw new ConflictException('Email already registered');

    const id = randomUUID();
    const passwordHash = await bcrypt.hash(dto.password, 10);
    await this.db.exec(
      `insert into users (id, email, password_hash, name, company)
       values ($1, $2, $3, $4, $5)`,
      [id, dto.email.toLowerCase(), passwordHash, dto.name, dto.company ?? ''],
    );
    const user = await this.db.queryOne<UserRow>(`select * from users where id = $1`, [id]);
    return this.sign(user!);
  }

  async login(dto: LoginDto) {
    const user = await this.db.queryOne<UserRow>(
      `select * from users where lower(email) = lower($1)`,
      [dto.email],
    );
    if (!user) throw new UnauthorizedException('Invalid email or password');
    const ok = await bcrypt.compare(dto.password, user.password_hash);
    if (!ok) throw new UnauthorizedException('Invalid email or password');
    return this.sign(user);
  }

  async me(userId: string) {
    const user = await this.db.queryOne<UserRow>(`select * from users where id = $1`, [userId]);
    if (!user) throw new UnauthorizedException();
    return this.publicUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    await this.me(userId);
    await this.db.exec(
      `update users set
         name = coalesce($2, name),
         company = coalesce($3, company),
         phone = coalesce($4, phone),
         tax_id = coalesce($5, tax_id),
         currency = coalesce($6, currency)
       where id = $1`,
      [userId, dto.name ?? null, dto.company ?? null, dto.phone ?? null, dto.taxId ?? null, dto.currency ?? null],
    );
    return this.me(userId);
  }
}
