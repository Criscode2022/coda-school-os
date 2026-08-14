import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="mx-auto max-w-xl space-y-6">
      <div>
        <p class="text-sm font-medium text-forest-700">School</p>
        <h1 class="font-display text-3xl">Settings</h1>
      </div>
      <form class="card space-y-4 p-5" [formGroup]="form" (ngSubmit)="save()">
        <div>
          <label class="label" for="name">Director</label>
          <input id="name" class="input" formControlName="name" />
        </div>
        <div>
          <label class="label" for="company">School name</label>
          <input id="company" class="input" formControlName="company" />
        </div>
        <div>
          <label class="label" for="phone">Phone</label>
          <input id="phone" class="input" formControlName="phone" />
        </div>
        <div>
          <label class="label" for="taxId">Tax ID</label>
          <input id="taxId" class="input" formControlName="taxId" />
        </div>
        <div>
          <label class="label" for="currency">Currency</label>
          <select id="currency" class="input" formControlName="currency">
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        @if (saved()) {
          <p class="text-sm text-forest-700">Saved.</p>
        }
        <button class="btn-primary min-h-11" type="submit" [disabled]="form.invalid || saving()">
          {{ saving() ? 'Saving…' : 'Save school' }}
        </button>
      </form>
    </div>
  `,
})
export class SettingsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);
  readonly saving = signal(false);
  readonly saved = signal(false);
  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    company: [''],
    phone: [''],
    taxId: [''],
    currency: ['EUR'],
  });

  ngOnInit() {
    const user = this.auth.user();
    if (user) {
      this.form.patchValue({
        name: user.name,
        company: user.company,
        phone: user.phone,
        taxId: user.taxId,
        currency: user.currency || 'EUR',
      });
    }
  }

  save() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.saved.set(false);
    this.api.updateProfile(this.form.getRawValue()).subscribe({
      next: (user) => {
        this.auth.setUser(user);
        this.saving.set(false);
        this.saved.set(true);
      },
      error: () => this.saving.set(false),
    });
  }
}
