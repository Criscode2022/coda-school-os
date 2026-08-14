import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Student } from '../../core/models';
import { badgeClass, labelize } from '../../core/format';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-medium text-forest-700">Register</p>
          <h1 class="font-display text-3xl">Students</h1>
        </div>
        <button type="button" class="btn-primary min-h-11" (click)="showForm.set(!showForm())">
          {{ showForm() ? 'Close' : 'Add student' }}
        </button>
      </div>
      @if (showForm()) {
        <form class="card grid gap-4 p-5 sm:grid-cols-2" [formGroup]="form" (ngSubmit)="create()">
          <div class="sm:col-span-2">
            <label class="label" for="name">Name</label>
            <input id="name" class="input" formControlName="name" />
          </div>
          <div>
            <label class="label" for="email">Email</label>
            <input id="email" class="input" type="email" formControlName="email" />
          </div>
          <div>
            <label class="label" for="phone">Phone</label>
            <input id="phone" class="input" formControlName="phone" />
          </div>
          <div>
            <label class="label" for="instrument">Instrument</label>
            <input id="instrument" class="input" formControlName="primaryInstrument" />
          </div>
          <div>
            <label class="label" for="level">Level</label>
            <select id="level" class="input" formControlName="level">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="diploma">Diploma</option>
            </select>
          </div>
          <div>
            <label class="label" for="guardianName">Guardian</label>
            <input id="guardianName" class="input" formControlName="guardianName" />
          </div>
          <div>
            <label class="label" for="guardianPhone">Guardian phone</label>
            <input id="guardianPhone" class="input" formControlName="guardianPhone" />
          </div>
          <div class="sm:col-span-2 flex justify-end">
            <button class="btn-primary min-h-11" type="submit" [disabled]="form.invalid || saving()">Save student</button>
          </div>
        </form>
      }
      <div class="overflow-x-auto card">
        <table class="w-full min-w-[640px] text-left text-sm">
          <thead class="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th class="px-4 py-3">Student</th>
              <th class="px-4 py-3">Instrument</th>
              <th class="px-4 py-3">Level</th>
              <th class="px-4 py-3">Guardian</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-ink-100">
            @for (s of students(); track s.id) {
              <tr>
                <td class="px-4 py-3">
                  <div class="font-semibold">{{ s.name }}</div>
                  <div class="text-xs text-ink-500">{{ s.email }}</div>
                </td>
                <td class="px-4 py-3 capitalize">{{ s.primary_instrument }}</td>
                <td class="px-4 py-3 capitalize">{{ s.level }}</td>
                <td class="px-4 py-3">
                  <div>{{ s.guardian_name || '—' }}</div>
                  <div class="text-xs text-ink-500">{{ s.guardian_phone }}</div>
                </td>
                <td class="px-4 py-3"><span [class]="badgeClass(s.status)">{{ labelize(s.status) }}</span></td>
                <td class="px-4 py-3 text-right">
                  <button type="button" class="btn-ghost !px-2 text-red-700" (click)="remove(s)">Remove</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="px-4 py-10 text-center text-ink-500">No students yet.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class StudentsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  readonly students = signal<Student[]>([]);
  readonly showForm = signal(false);
  readonly saving = signal(false);
  readonly badgeClass = badgeClass;
  readonly labelize = labelize;
  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: [''],
    phone: [''],
    primaryInstrument: ['piano'],
    level: ['beginner'],
    guardianName: [''],
    guardianPhone: [''],
  });

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.api.listStudents().subscribe((rows) => this.students.set(rows));
  }

  create() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.api.createStudent(this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.form.reset({ primaryInstrument: 'piano', level: 'beginner' });
        this.reload();
      },
      error: () => this.saving.set(false),
    });
  }

  remove(s: Student) {
    this.api.deleteStudent(s.id).subscribe(() => this.reload());
  }
}
