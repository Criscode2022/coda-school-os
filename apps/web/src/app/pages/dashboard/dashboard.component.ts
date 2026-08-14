import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { DashboardSummary } from '../../core/models';
import { badgeClass, dateLabel, labelize, money } from '../../core/format';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-medium text-forest-700">Studio</p>
          <h1 class="font-display text-3xl">Good day, {{ firstName }}</h1>
          <p class="mt-1 text-sm text-ink-500">
            Lessons, tuition, and the next recital.
            <span class="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-semibold">DB {{ data()?.dbSource || '…' }}</span>
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <a routerLink="/app/schedule" class="btn-secondary min-h-11">Open schedule</a>
          <a routerLink="/app/tuition" class="btn-primary min-h-11">Tuition ledger</a>
        </div>
      </div>
      @if (loading()) {
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          @for (i of [1, 2, 3, 4]; track i) {
            <div class="card h-28 animate-pulse bg-ink-100/60"></div>
          }
        </div>
      } @else if (data()) {
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div class="card p-5">
            <div class="text-xs font-semibold uppercase tracking-wide text-ink-500">Active students</div>
            <div class="mt-2 font-display text-3xl">{{ data()!.kpis.activeStudents }}</div>
            <div class="text-xs text-ink-500">{{ data()!.kpis.teachers }} faculty · {{ data()!.kpis.rooms }} rooms</div>
          </div>
          <div class="card p-5">
            <div class="text-xs font-semibold uppercase tracking-wide text-ink-500">Contracted / mo</div>
            <div class="mt-2 font-display text-3xl">{{ money(data()!.kpis.monthlyTuition, currency) }}</div>
            <div class="text-xs text-ink-500">{{ data()!.kpis.todayLessons }} lessons today</div>
          </div>
          <div class="card p-5">
            <div class="text-xs font-semibold uppercase tracking-wide text-ink-500">Collected this month</div>
            <div class="mt-2 font-display text-3xl text-forest-700">{{ money(data()!.kpis.collectedThisMonth, currency) }}</div>
            <div class="text-xs text-ink-500">Paid invoices</div>
          </div>
          <div class="card p-5">
            <div class="text-xs font-semibold uppercase tracking-wide text-ink-500">Overdue</div>
            <div class="mt-2 font-display text-3xl text-red-700">{{ money(data()!.kpis.overdue, currency) }}</div>
            <div class="text-xs text-ink-500">{{ data()!.kpis.rentedInstruments }} instruments out</div>
          </div>
        </div>
        <div class="grid gap-4 lg:grid-cols-5">
          <div class="card overflow-hidden lg:col-span-3">
            <div class="flex items-center justify-between border-b border-ink-100 px-5 py-4">
              <h2 class="font-display text-lg">Today’s board</h2>
              <a routerLink="/app/schedule" class="text-xs font-semibold text-forest-700">Full week</a>
            </div>
            <ul class="divide-y divide-ink-100">
              @for (l of data()!.todaySchedule; track l.id) {
                <li class="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                  <div>
                    <div class="text-sm font-semibold">{{ l.start_time }} · {{ l.student_name }}</div>
                    <div class="text-xs text-ink-500">
                      {{ l.instrument }} · {{ l.teacher_name }} · {{ l.room_name || 'unassigned' }} · {{ l.duration_min }} min
                    </div>
                  </div>
                  <span [class]="badgeClass(l.status)">{{ labelize(l.status) }}</span>
                </li>
              } @empty {
                <li class="px-5 py-8 text-center text-sm text-ink-500">No lessons on the board today.</li>
              }
            </ul>
          </div>
          <div class="space-y-4 lg:col-span-2">
            <div class="card p-5">
              <h2 class="mb-4 font-display text-lg">Collected tuition</h2>
              @if (data()!.collectedByMonth.length === 0) {
                <p class="text-sm text-ink-500">No paid invoices yet.</p>
              } @else {
                <div class="flex h-36 items-end gap-3">
                  @for (m of data()!.collectedByMonth; track m.month) {
                    <div class="flex flex-1 flex-col items-center gap-2">
                      <div class="w-full rounded-t-lg bg-forest-600/90" [style.height.%]="barHeight(m.total)"></div>
                      <div class="text-[10px] font-medium text-ink-500">{{ m.month.slice(5) }}</div>
                    </div>
                  }
                </div>
              }
            </div>
            @if (data()!.upcomingRecital) {
              <div class="card p-5">
                <div class="text-xs font-semibold uppercase tracking-wide text-forest-700">Next recital</div>
                <div class="mt-1 font-display text-xl">{{ data()!.upcomingRecital!.title }}</div>
                <p class="mt-1 text-sm text-ink-500">
                  {{ dateLabel(data()!.upcomingRecital!.recital_date) }} · {{ data()!.upcomingRecital!.venue }}
                </p>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);
  readonly loading = signal(true);
  readonly data = signal<DashboardSummary | null>(null);
  readonly money = money;
  readonly labelize = labelize;
  readonly badgeClass = badgeClass;
  readonly dateLabel = dateLabel;

  get firstName() {
    return this.auth.user()?.name?.split(' ')[0] || 'there';
  }
  get currency() {
    return this.auth.user()?.currency || 'EUR';
  }

  ngOnInit() {
    this.api.dashboard().subscribe({
      next: (d) => {
        this.data.set(d);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  barHeight(value: number) {
    const max = Math.max(...(this.data()?.collectedByMonth.map((s) => s.total) || [1]), 1);
    return Math.max(8, (value / max) * 100);
  }
}
