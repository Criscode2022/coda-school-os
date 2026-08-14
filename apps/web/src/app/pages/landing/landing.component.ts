import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-paper">
      <header class="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 lg:px-8">
        <div class="flex items-center gap-2">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-600 font-display text-lg text-paper">C</div>
          <span class="font-display text-xl text-ink-900">Coda</span>
        </div>
        <div class="flex items-center gap-2">
          <a routerLink="/login" class="btn-ghost min-h-11">Sign in</a>
          <a routerLink="/register" class="btn-primary min-h-11">Open studio</a>
        </div>
      </header>
      <main class="mx-auto max-w-6xl px-4 pb-20 pt-10 lg:px-8 lg:pt-16">
        <p class="mb-4 inline-flex rounded-full border border-ink-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-forest-700">
          For independent conservatories
        </p>
        <h1 class="max-w-3xl font-display text-4xl leading-[1.08] text-ink-900 sm:text-6xl">
          The studio book, the ledger, and the recital — in one quiet room.
        </h1>
        <p class="mt-5 max-w-2xl text-lg leading-relaxed text-ink-600">
          Coda runs a small music school: students and guardians, faculty hours, rooms, weekly lessons, tuition, instrument rentals, and the next concert.
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <a routerLink="/register" class="btn-primary min-h-11">Start a school</a>
          <a routerLink="/login" class="btn-secondary min-h-11">Try Conservatori Mar</a>
        </div>
        <div class="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          @for (f of features; track f.title) {
            <div class="card p-5">
              <div class="text-xs font-semibold uppercase tracking-wider text-forest-700">{{ f.kicker }}</div>
              <h2 class="mt-2 font-display text-xl text-ink-900">{{ f.title }}</h2>
              <p class="mt-2 text-sm leading-relaxed text-ink-600">{{ f.body }}</p>
            </div>
          }
        </div>
      </main>
    </div>
  `,
})
export class LandingComponent {
  readonly features = [
    { kicker: 'People', title: 'Students & faculty', body: 'Levels, instruments, guardians, and hourly rates — not a shared spreadsheet.' },
    { kicker: 'Time', title: 'Rooms & lessons', body: 'Today’s board at a glance. Mark completed, cancelled, or no-show.' },
    { kicker: 'Cash', title: 'Tuition ledger', body: 'Monthly fees, overdue invoices, and one-click generation for the period.' },
    { kicker: 'Stage', title: 'Rentals & recitals', body: 'Who has the cello, and who plays Debussy on the 20th.' },
  ];
}
