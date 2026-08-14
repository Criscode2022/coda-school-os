import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Instrument, Student } from '../../core/models';
import { badgeClass, labelize, money } from '../../core/format';

@Component({
  selector: 'app-instruments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-medium text-forest-700">Fleet</p>
          <h1 class="font-display text-3xl">Instrument rentals</h1>
        </div>
        <button type="button" class="btn-primary min-h-11" (click)="showForm.set(!showForm())">
          {{ showForm() ? 'Close' : 'Add instrument' }}
        </button>
      </div>
      @if (showForm()) {
        <form class="card grid gap-4 p-5 sm:grid-cols-2" [formGroup]="form" (ngSubmit)="create()">
          <div>
            <label class="label" for="name">Name</label>
            <input id="name" class="input" formControlName="name" />
          </div>
          <div>
            <label class="label" for="type">Type</label>
            <select id="type" class="input" formControlName="type">
              @for (t of types; track t) {
                <option [value]="t">{{ t }}</option>
              }
            </select>
          </div>
          <div>
            <label class="label" for="serial">Serial</label>
            <input id="serial" class="input" formControlName="serial" />
          </div>
          <div>
            <label class="label" for="monthlyRate">Monthly rate</label>
            <input id="monthlyRate" class="input" type="number" formControlName="monthlyRate" />
          </div>
          <div class="sm:col-span-2 flex justify-end">
            <button class="btn-primary min-h-11" type="submit" [disabled]="form.invalid">Save instrument</button>
          </div>
        </form>
      }
      <div class="overflow-x-auto card">
        <table class="w-full min-w-[640px] text-left text-sm">
          <thead class="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th class="px-4 py-3">Instrument</th>
              <th class="px-4 py-3">Condition</th>
              <th class="px-4 py-3">Rate</th>
              <th class="px-4 py-3">With</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-ink-100">
            @for (i of instruments(); track i.id) {
              <tr>
                <td class="px-4 py-3">
                  <div class="font-semibold">{{ i.name }}</div>
                  <div class="text-xs text-ink-500 capitalize">{{ i.type }} · {{ i.serial || 'no serial' }}</div>
                </td>
                <td class="px-4 py-3 capitalize">{{ i.condition }}</td>
                <td class="px-4 py-3">{{ money(i.monthly_rate, currency) }}</td>
                <td class="px-4 py-3">
                  <select class="input !py-1.5" [value]="i.student_id || ''" (change)="assign(i, $event)">
                    <option value="">In store</option>
                    @for (s of students(); track s.id) {
                      <option [value]="s.id">{{ s.name }}</option>
                    }
                  </select>
                </td>
                <td class="px-4 py-3"><span [class]="badgeClass(i.status)">{{ labelize(i.status) }}</span></td>
                <td class="px-4 py-3 text-right">
                  <button type="button" class="btn-ghost !px-2 text-red-700" (click)="remove(i)">Remove</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class InstrumentsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);
  readonly instruments = signal<Instrument[]>([]);
  readonly students = signal<Student[]>([]);
  readonly showForm = signal(false);
  readonly types = ['piano', 'violin', 'cello', 'guitar', 'flute', 'clarinet', 'drums', 'other'];
  readonly money = money;
  readonly labelize = labelize;
  readonly badgeClass = badgeClass;
  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    type: ['violin'],
    serial: [''],
    monthlyRate: [20],
  });

  get currency() {
    return this.auth.user()?.currency || 'EUR';
  }

  ngOnInit() {
    this.reload();
    this.api.listStudents().subscribe((rows) => this.students.set(rows));
  }

  reload() {
    this.api.listInstruments().subscribe((rows) => this.instruments.set(rows));
  }

  create() {
    if (this.form.invalid) return;
    this.api.createInstrument(this.form.getRawValue()).subscribe(() => {
      this.showForm.set(false);
      this.reload();
    });
  }

  assign(instrument: Instrument, event: Event) {
    const studentId = (event.target as HTMLSelectElement).value;
    this.api
      .updateInstrument(instrument.id, { studentId, status: studentId ? 'rented' : 'available' })
      .subscribe(() => this.reload());
  }

  remove(i: Instrument) {
    this.api.deleteInstrument(i.id).subscribe(() => this.reload());
  }
}
