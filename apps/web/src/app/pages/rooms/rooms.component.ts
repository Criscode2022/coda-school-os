import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Room } from '../../core/models';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-medium text-forest-700">Building</p>
          <h1 class="font-display text-3xl">Rooms</h1>
        </div>
        <button type="button" class="btn-primary min-h-11" (click)="showForm.set(!showForm())">
          {{ showForm() ? 'Close' : 'Add room' }}
        </button>
      </div>
      @if (showForm()) {
        <form class="card grid gap-4 p-5 sm:grid-cols-2" [formGroup]="form" (ngSubmit)="create()">
          <div>
            <label class="label" for="name">Name</label>
            <input id="name" class="input" formControlName="name" />
          </div>
          <div>
            <label class="label" for="capacity">Capacity</label>
            <input id="capacity" class="input" type="number" formControlName="capacity" />
          </div>
          <label class="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" formControlName="hasPiano" />
            Has a piano
          </label>
          <div class="sm:col-span-2">
            <label class="label" for="notes">Notes</label>
            <input id="notes" class="input" formControlName="notes" />
          </div>
          <div class="sm:col-span-2 flex justify-end">
            <button class="btn-primary min-h-11" type="submit" [disabled]="form.invalid">Save room</button>
          </div>
        </form>
      }
      <div class="grid gap-4 sm:grid-cols-2">
        @for (r of rooms(); track r.id) {
          <div class="card p-5">
            <div class="flex items-start justify-between">
              <h2 class="font-display text-xl">{{ r.name }}</h2>
              <button type="button" class="btn-ghost !px-2 text-red-700" (click)="remove(r)">Remove</button>
            </div>
            <p class="mt-2 text-sm text-ink-600">{{ r.notes || 'No notes.' }}</p>
            <div class="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-500">
              {{ r.capacity }} seats · {{ r.has_piano ? 'Piano' : 'No piano' }}
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class RoomsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  readonly rooms = signal<Room[]>([]);
  readonly showForm = signal(false);
  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    capacity: [2],
    hasPiano: [false],
    notes: [''],
  });

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.api.listRooms().subscribe((rows) => this.rooms.set(rows));
  }

  create() {
    if (this.form.invalid) return;
    this.api.createRoom(this.form.getRawValue()).subscribe(() => {
      this.showForm.set(false);
      this.form.reset({ capacity: 2, hasPiano: false });
      this.reload();
    });
  }

  remove(r: Room) {
    this.api.deleteRoom(r.id).subscribe(() => this.reload());
  }
}
