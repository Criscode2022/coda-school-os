import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { TeachersModule } from './teachers/teachers.module';
import { RoomsModule } from './rooms/rooms.module';
import { LessonsModule } from './lessons/lessons.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { InvoicesModule } from './invoices/invoices.module';
import { InstrumentsModule } from './instruments/instruments.module';
import { RecitalsModule } from './recitals/recitals.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    StudentsModule,
    TeachersModule,
    RoomsModule,
    LessonsModule,
    EnrollmentsModule,
    InvoicesModule,
    InstrumentsModule,
    RecitalsModule,
    DashboardModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
