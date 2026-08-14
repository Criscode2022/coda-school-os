import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Teacher } from '../../core/models';
import { badgeClass, labelize, money } from '../../core/format';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-faculty',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-medium text-forest-700">People</p>
          <h1 class="font-display text-3xl">Faculty</h1>
        </div>
        <button type="button" class="btn-primary min-h-11" (click)="showForm.set(!showForm())">
          {{ showForm() ? 'Close' : 'Add teacher' }}
        </button>
      </div>
      @if (showForm()) {
        <form class="card grid gap-4 p-5 sm:grid-cols-2" [formGroup]="form" (ngSubmit)="create()">
          <div>
            <label class="label" for="name">Name</label>
            <input id="name" class="input" formControlName="name" />
          </div>
          <div>
            <label class="label" for="email">Email</label>
            <input id="email" class="input" type="email" formControlName="email" />
          </div>
          <div>
            <label class="label" for="instruments">Instruments</label>
            <input id="instruments" class="input" formControlName="instruments" />
          </div>
          <div>
            <label class="label" for="hourlyRate">Hourly rate</label>
            <input id="hourlyRate" class="input" type="number" formControlName="hourlyRate" />
          </div>
          <div class="sm:col-span-2">
            <label class="label" for="bio">Bio</label>
            <input id="bio" class="input" formControlName="bio" />
          </div>
          <div class="sm:col-span-2 flex justify-end">
            <button class="btn-primary min-h-11" type="submit" [disabled]="form.invalid">Save teacher</button>
          </div>
        </form>
      }
      <div class="grid gap-4 sm:grid-cols-2">
        @for (t of teachers(); track t.id) {
          <div class="card p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h2 class="font-display text-xl">{{ t.name }}</h2>
                <p class="text-sm text-ink-500">{{ t.instruments }}</p>
              </div>
              <span [class]="badgeClass(t.status)">{{ labelize(t.status) }}</span>
            </div>
            <p class="mt-3 text-sm leading-relaxed text-ink-600">{{ t.bio || 'No bio yet.' }}</p>
            <div class="mt-4 flex items-center justify-between text-sm">
              <span class="font-semibold">{{ money(t.hourly_rate, currency) }}/h</span>
              <button type="button" class="btn-ghost !px-2 text-red-700" (click)="remove(t)">Remove</button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class FacultyComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);
  readonly teachers = signal<Teacher[]>([]);
  readonly showForm = signal(false);
  readonly badgeClass = badgeClass;
  readonly labelize = labelize;
  readonly money = money;
  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: [''],
    instruments: [''],
    hourlyRate: [36],
    bio: [''],
  });

  get currency() {
    return this.auth.user()?.currency || 'EUR';
  }

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.api.listTeachers().subscribe((rows) => this.teachers.set(rows));
  }

  create() {
    if (this.form.invalid) return;
    this.api.createTeacher(this.form.getRawValue()).subscribe(() => {
      this.showForm.set(false);
      this.form.reset({ hourlyRate: 36 });
      this.reload();
    });
  }

  remove(t: Teacher) {
    this.api.deleteTeacher(t.id).subscribe(() => this.reload());
  }
}
