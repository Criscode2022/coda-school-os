import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="grid min-h-screen lg:grid-cols-2">
      <div class="hidden flex-col justify-between bg-forest-800 p-10 text-paper lg:flex">
        <div class="flex items-center gap-2 font-display text-2xl">C Coda</div>
        <div>
          <h1 class="font-display text-4xl leading-tight">Keep the rooms full and the invoices quiet.</h1>
          <p class="mt-4 max-w-md text-forest-100">Built for independent schools — a handful of teachers, a Saturday recital, and a ledger that does not live in WhatsApp.</p>
        </div>
        <p class="text-sm text-forest-200">Demo school: Conservatori Mar, Valencia.</p>
      </div>
      <div class="grid place-items-center bg-paper px-4 py-10">
        <div class="card w-full max-w-md p-6 sm:p-8">
          <h2 class="font-display text-2xl text-ink-900">Welcome back</h2>
          <p class="mt-1 text-sm text-ink-500">Sign in to your Coda workspace</p>
          <form class="mt-6 space-y-4" [formGroup]="form" (ngSubmit)="submit()">
            <div>
              <label class="label" for="email">Email</label>
              <input id="email" class="input" type="email" formControlName="email" autocomplete="username" />
            </div>
            <div>
              <label class="label" for="password">Password</label>
              <input id="password" class="input" type="password" formControlName="password" autocomplete="current-password" />
            </div>
            @if (error()) {
              <div class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ error() }}</div>
            }
            <button class="btn-primary w-full min-h-11" type="submit" [disabled]="form.invalid || loading()">
              {{ loading() ? 'Signing in…' : 'Sign in' }}
            </button>
          </form>
          <div class="mt-5 rounded-xl border border-dashed border-ink-200 bg-paper-50 p-3 text-xs text-ink-600">
            <div class="font-semibold text-ink-800">Demo</div>
            <div class="mt-1">demo&#64;coda.school / demo1234</div>
            <button type="button" class="btn-ghost mt-2 !px-2 !py-1 text-forest-700" (click)="fillDemo()">Use demo credentials</button>
          </div>
          <p class="mt-6 text-center text-sm text-ink-500">
            New here? <a routerLink="/register" class="font-semibold text-forest-700 hover:underline">Create an account</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  fillDemo() {
    this.form.setValue({ email: 'demo@coda.school', password: 'demo1234' });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigateByUrl('/app');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Unable to sign in');
      },
    });
  }
}
