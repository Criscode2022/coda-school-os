import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Lesson, Room, Student, Teacher } from '../../core/models';
import { badgeClass, dateLabel, labelize } from '../../core/format';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-medium text-forest-700">Week</p>
          <h1 class="font-display text-3xl">Schedule</h1>
        </div>
        <button type="button" class="btn-primary min-h-11" (click)="showForm.set(!showForm())">
          {{ showForm() ? 'Close' : 'Book lesson' }}
        </button>
      </div>
      @if (showForm()) {
        <form class="card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3" [formGroup]="form" (ngSubmit)="create()">
          <div>
            <label class="label" for="studentId">Student</label>
            <select id="studentId" class="input" formControlName="studentId">
              <option value="">Select</option>
              @for (s of students(); track s.id) {
                <option [value]="s.id">{{ s.name }}</option>
              }
            </select>
          </div>
          <div>
            <label class="label" for="teacherId">Teacher</label>
            <select id="teacherId" class="input" formControlName="teacherId">
              <option value="">Select</option>
              @for (t of teachers(); track t.id) {
                <option [value]="t.id">{{ t.name }}</option>
              }
            </select>
          </div>
          <div>
            <label class="label" for="roomId">Room</label>
            <select id="roomId" class="input" formControlName="roomId">
              <option value="">Unassigned</option>
              @for (r of rooms(); track r.id) {
                <option [value]="r.id">{{ r.name }}</option>
              }
            </select>
          </div>
          <div>
            <label class="label" for="lessonDate">Date</label>
            <input id="lessonDate" class="input" type="date" formControlName="lessonDate" />
          </div>
          <div>
            <label class="label" for="startTime">Start</label>
            <input id="startTime" class="input" type="time" formControlName="startTime" />
          </div>
          <div>
            <label class="label" for="durationMin">Minutes</label>
            <input id="durationMin" class="input" type="number" formControlName="durationMin" />
          </div>
          <div>
            <label class="label" for="instrument">Instrument</label>
            <input id="instrument" class="input" formControlName="instrument" />
          </div>
          <div class="sm:col-span-2 lg:col-span-3 flex justify-end">
            <button class="btn-primary min-h-11" type="submit" [disabled]="form.invalid">Save lesson</button>
          </div>
        </form>
      }
      <div class="space-y-3">
        @for (group of grouped(); track group.date) {
          <section class="card overflow-hidden">
            <div class="border-b border-ink-100 px-5 py-3 font-display text-lg">{{ dateLabel(group.date) }}</div>
            <ul class="divide-y divide-ink-100">
              @for (l of group.lessons; track l.id) {
                <li class="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div>
                    <div class="text-sm font-semibold">{{ l.start_time }} · {{ l.student_name }}</div>
                    <div class="text-xs text-ink-500">
                      {{ l.instrument }} · {{ l.teacher_name }} · {{ l.room_name || 'unassigned' }} · {{ l.duration_min }} min
                    </div>
                  </div>
                  <div class="flex flex-wrap items-center gap-2">
                    <span [class]="badgeClass(l.status)">{{ labelize(l.status) }}</span>
                    @if (l.status === 'scheduled') {
                      <button type="button" class="btn-secondary !min-h-10 !px-3" (click)="mark(l, 'completed')">Done</button>
                      <button type="button" class="btn-ghost !min-h-10 !px-3" (click)="mark(l, 'no_show')">No-show</button>
                    }
                  </div>
                </li>
              }
            </ul>
          </section>
        }
      </div>
    </div>
  `,
})
export class ScheduleComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  readonly lessons = signal<Lesson[]>([]);
  readonly students = signal<Student[]>([]);
  readonly teachers = signal<Teacher[]>([]);
  readonly rooms = signal<Room[]>([]);
  readonly showForm = signal(false);
  readonly badgeClass = badgeClass;
  readonly labelize = labelize;
  readonly dateLabel = dateLabel;
  readonly form = this.fb.nonNullable.group({
    studentId: ['', Validators.required],
    teacherId: ['', Validators.required],
    roomId: [''],
    lessonDate: ['', Validators.required],
    startTime: ['16:00', Validators.required],
    durationMin: [45],
    instrument: ['piano'],
  });

  grouped() {
    const map = new Map<string, Lesson[]>();
    for (const l of this.lessons()) {
      const key = String(l.lesson_date).slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(l);
      map.set(key, list);
    }
    return [...map.entries()].map(([date, lessons]) => ({ date, lessons }));
  }

  ngOnInit() {
    this.reload();
    this.api.listStudents().subscribe((r) => this.students.set(r));
    this.api.listTeachers().subscribe((r) => this.teachers.set(r));
    this.api.listRooms().subscribe((r) => this.rooms.set(r));
  }

  reload() {
    this.api.listLessons().subscribe((rows) => this.lessons.set(rows));
  }

  create() {
    if (this.form.invalid) return;
    this.api.createLesson(this.form.getRawValue()).subscribe(() => {
      this.showForm.set(false);
      this.reload();
    });
  }

  mark(lesson: Lesson, status: string) {
    this.api.updateLesson(lesson.id, { status }).subscribe(() => this.reload());
  }
}
