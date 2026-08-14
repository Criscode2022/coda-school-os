import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <header class="sticky top-0 z-30 flex items-center justify-between border-b border-ink-100 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <div class="flex items-center gap-2">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-600 font-display text-lg text-paper">C</div>
          <span class="font-display text-lg">Coda</span>
        </div>
        <button type="button" class="btn-secondary !min-h-11 !px-3" (click)="menuOpen.set(!menuOpen())">Menu</button>
      </header>
      <aside
        class="fixed inset-y-0 left-0 z-40 w-64 transform border-r border-white/10 bg-ink-950 text-ink-100 transition lg:static lg:translate-x-0"
        [class.-translate-x-full]="!menuOpen()"
        [class.translate-x-0]="menuOpen()"
      >
        <div class="flex h-full flex-col">
          <div class="hidden items-center gap-3 px-5 py-6 lg:flex">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-forest-500 font-display text-xl text-paper">C</div>
            <div>
              <div class="font-display text-xl text-white">Coda</div>
              <div class="text-xs text-ink-400">Music school OS</div>
            </div>
          </div>
          <nav class="flex-1 space-y-1 px-3 py-4">
            @for (item of nav; track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="bg-white/10 text-white"
                [routerLinkActiveOptions]="{ exact: item.exact }"
                class="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-300 transition hover:bg-white/5 hover:text-white"
                (click)="menuOpen.set(false)"
                >{{ item.label }}</a
              >
            }
          </nav>
          <div class="border-t border-white/10 p-4">
            <div class="mb-3 rounded-2xl bg-white/5 p-3">
              <div class="text-sm font-semibold text-white">{{ auth.user()?.name || 'Account' }}</div>
              <div class="truncate text-xs text-ink-400">{{ auth.user()?.company || auth.user()?.email }}</div>
            </div>
            <button type="button" class="btn-secondary w-full border-white/10 bg-transparent text-ink-100 hover:bg-white/10" (click)="auth.logout()">
              Sign out
            </button>
          </div>
        </div>
      </aside>
      @if (menuOpen()) {
        <div class="fixed inset-0 z-30 bg-ink-950/40 lg:hidden" (click)="menuOpen.set(false)"></div>
      }
      <main class="min-w-0 bg-paper">
        <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
})
export class ShellComponent {
  readonly auth = inject(AuthService);
  readonly menuOpen = signal(false);
  readonly nav = [
    { path: '/app', label: 'Today', exact: true },
    { path: '/app/schedule', label: 'Schedule', exact: false },
    { path: '/app/students', label: 'Students', exact: false },
    { path: '/app/faculty', label: 'Faculty', exact: false },
    { path: '/app/rooms', label: 'Rooms', exact: false },
    { path: '/app/tuition', label: 'Tuition', exact: false },
    { path: '/app/instruments', label: 'Rentals', exact: false },
    { path: '/app/recitals', label: 'Recitals', exact: false },
    { path: '/app/settings', label: 'Settings', exact: false },
  ];
}
