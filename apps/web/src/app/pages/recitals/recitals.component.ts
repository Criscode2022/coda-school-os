import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Recital, Student } from '../../core/models';
import { badgeClass, dateLabel, labelize } from '../../core/format';

@Component({
  selector: 'app-recitals',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-medium text-forest-700">Stage</p>
          <h1 class="font-display text-3xl">Recitals</h1>
        </div>
        <button type="button" class="btn-primary min-h-11" (click)="showForm.set(!showForm())">
          {{ showForm() ? 'Close' : 'New recital' }}
        </button>
      </div>
      @if (showForm()) {
        <form class="card grid gap-4 p-5 sm:grid-cols-2" [formGroup]="form" (ngSubmit)="create()">
          <div>
            <label class="label" for="title">Title</label>
            <input id="title" class="input" formControlName="title" />
          </div>
          <div>
            <label class="label" for="venue">Venue</label>
            <input id="venue" class="input" formControlName="venue" />
          </div>
          <div>
            <label class="label" for="recitalDate">Date</label>
            <input id="recitalDate" class="input" type="date" formControlName="recitalDate" />
          </div>
          <div>
            <label class="label" for="programNotes">Notes</label>
            <input id="programNotes" class="input" formControlName="programNotes" />
          </div>
          <div class="sm:col-span-2 flex justify-end">
            <button class="btn-primary min-h-11" type="submit" [disabled]="form.invalid">Save recital</button>
          </div>
        </form>
      }
      <div class="space-y-4">
        @for (r of recitals(); track r.id) {
          <article class="card p-5">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 class="font-display text-2xl">{{ r.title }}</h2>
                <p class="text-sm text-ink-500">{{ dateLabel(r.recital_date) }} · {{ r.venue }}</p>
              </div>
              <span [class]="badgeClass(r.status)">{{ labelize(r.status) }}</span>
            </div>
            @if (r.program_notes) {
              <p class="mt-3 text-sm leading-relaxed text-ink-600">{{ r.program_notes }}</p>
            }
            <ol class="mt-4 space-y-2">
              @for (p of r.pieces; track p.id) {
                <li class="flex flex-wrap items-baseline justify-between gap-2 rounded-xl bg-paper-50 px-3 py-2 text-sm">
                  <span><span class="font-semibold">{{ p.student_name }}</span> — {{ p.piece }}</span>
                  <span class="text-ink-500">{{ p.composer }}</span>
                </li>
              }
            </ol>
            <form class="mt-4 grid gap-3 sm:grid-cols-4" [formGroup]="pieceForm" (ngSubmit)="addPiece(r)">
              <select class="input sm:col-span-1" formControlName="studentId">
                <option value="">Student</option>
                @for (s of students(); track s.id) {
                  <option [value]="s.id">{{ s.name }}</option>
                }
              </select>
              <input class="input sm:col-span-1" placeholder="Piece" formControlName="piece" />
              <input class="input sm:col-span-1" placeholder="Composer" formControlName="composer" />
              <button class="btn-secondary min-h-11" type="submit" [disabled]="pieceForm.invalid">Add to program</button>
            </form>
          </article>
        }
      </div>
    </div>
  `,
})
export class RecitalsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  readonly recitals = signal<Recital[]>([]);
  readonly students = signal<Student[]>([]);
  readonly showForm = signal(false);
  readonly badgeClass = badgeClass;
  readonly labelize = labelize;
  readonly dateLabel = dateLabel;
  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    venue: [''],
    recitalDate: ['', Validators.required],
    programNotes: [''],
  });
  readonly pieceForm = this.fb.nonNullable.group({
    studentId: ['', Validators.required],
    piece: ['', Validators.required],
    composer: [''],
  });

  ngOnInit() {
    this.reload();
    this.api.listStudents().subscribe((rows) => this.students.set(rows));
  }

  reload() {
    this.api.listRecitals().subscribe((rows) => this.recitals.set(rows));
  }

  create() {
    if (this.form.invalid) return;
    this.api.createRecital(this.form.getRawValue()).subscribe(() => {
      this.showForm.set(false);
      this.reload();
    });
  }

  addPiece(recital: Recital) {
    if (this.pieceForm.invalid) return;
    this.api.addPiece(recital.id, this.pieceForm.getRawValue()).subscribe(() => {
      this.pieceForm.reset();
      this.reload();
    });
  }
}
