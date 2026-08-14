import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="grid min-h-screen place-items-center bg-paper px-4 py-10">
      <div class="card w-full max-w-md p-6 sm:p-8">
        <a routerLink="/" class="text-xs font-semibold uppercase tracking-wider text-forest-700">Coda</a>
        <h2 class="mt-2 font-display text-2xl text-ink-900">Open a school workspace</h2>
        <p class="mt-1 text-sm text-ink-500">Your own ledger. No demo data unless you sign in as Elena.</p>
        <form class="mt-6 space-y-4" [formGroup]="form" (ngSubmit)="submit()">
          <div>
            <label class="label" for="name">Your name</label>
            <input id="name" class="input" formControlName="name" />
          </div>
          <div>
            <label class="label" for="company">School name</label>
            <input id="company" class="input" formControlName="company" />
          </div>
          <div>
            <label class="label" for="email">Email</label>
            <input id="email" class="input" type="email" formControlName="email" />
          </div>
          <div>
            <label class="label" for="password">Password</label>
            <input id="password" class="input" type="password" formControlName="password" />
          </div>
          @if (error()) {
            <div class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ error() }}</div>
          }
          <button class="btn-primary w-full min-h-11" type="submit" [disabled]="form.invalid || loading()">
            {{ loading() ? 'Creating…' : 'Create workspace' }}
          </button>
        </form>
        <p class="mt-6 text-center text-sm text-ink-500">
          Already have one? <a routerLink="/login" class="font-semibold text-forest-700 hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    company: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigateByUrl('/app');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Unable to register');
      },
    });
  }
}
