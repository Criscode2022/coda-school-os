import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Enrollment, Invoice } from '../../core/models';
import { badgeClass, dateLabel, labelize, money } from '../../core/format';

@Component({
  selector: 'app-tuition',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-medium text-forest-700">Ledger</p>
          <h1 class="font-display text-3xl">Tuition</h1>
        </div>
        <button type="button" class="btn-primary min-h-11" (click)="generate()" [disabled]="generating()">
          {{ generating() ? 'Generating…' : 'Generate this month' }}
        </button>
      </div>
      @if (notice()) {
        <div class="rounded-xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm text-forest-800">{{ notice() }}</div>
      }
      <div class="grid gap-4 lg:grid-cols-3">
        <div class="card overflow-hidden lg:col-span-2">
          <div class="border-b border-ink-100 px-5 py-4 font-display text-lg">Invoices</div>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[560px] text-left text-sm">
              <thead class="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th class="px-4 py-3">Invoice</th>
                  <th class="px-4 py-3">Student</th>
                  <th class="px-4 py-3">Amount</th>
                  <th class="px-4 py-3">Due</th>
                  <th class="px-4 py-3">Status</th>
                  <th class="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-ink-100">
                @for (i of invoices(); track i.id) {
                  <tr>
                    <td class="px-4 py-3">
                      <div class="font-semibold">{{ i.number }}</div>
                      <div class="text-xs text-ink-500">{{ i.period_label }}</div>
                    </td>
                    <td class="px-4 py-3">{{ i.student_name }}</td>
                    <td class="px-4 py-3">{{ money(i.amount, currency) }}</td>
                    <td class="px-4 py-3">{{ dateLabel(i.due_date) }}</td>
                    <td class="px-4 py-3"><span [class]="badgeClass(i.status)">{{ labelize(i.status) }}</span></td>
                    <td class="px-4 py-3 text-right">
                      @if (i.status !== 'paid') {
                        <button type="button" class="btn-secondary !min-h-10 !px-3" (click)="markPaid(i)">Mark paid</button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
        <div class="card overflow-hidden">
          <div class="border-b border-ink-100 px-5 py-4 font-display text-lg">Plans</div>
          <ul class="divide-y divide-ink-100">
            @for (e of enrollments(); track e.id) {
              <li class="px-5 py-3">
                <div class="text-sm font-semibold">{{ e.student_name }}</div>
                <div class="text-xs text-ink-500">{{ labelize(e.plan) }} · {{ money(e.monthly_fee, currency) }}/mo</div>
              </li>
            }
          </ul>
        </div>
      </div>
    </div>
  `,
})
export class TuitionComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);
  readonly invoices = signal<Invoice[]>([]);
  readonly enrollments = signal<Enrollment[]>([]);
  readonly generating = signal(false);
  readonly notice = signal('');
  readonly money = money;
  readonly labelize = labelize;
  readonly badgeClass = badgeClass;
  readonly dateLabel = dateLabel;

  get currency() {
    return this.auth.user()?.currency || 'EUR';
  }

  ngOnInit() {
    this.reload();
    this.api.listEnrollments().subscribe((rows) => this.enrollments.set(rows));
  }

  reload() {
    this.api.listInvoices().subscribe((rows) => this.invoices.set(rows));
  }

  generate() {
    this.generating.set(true);
    this.api.generateInvoices().subscribe({
      next: (res) => {
        this.generating.set(false);
        this.notice.set(res.created ? `Created ${res.created} invoices for ${res.period}.` : `Invoices for ${res.period} already exist.`);
        this.reload();
      },
      error: () => this.generating.set(false),
    });
  }

  markPaid(invoice: Invoice) {
    this.api.updateInvoice(invoice.id, { status: 'paid' }).subscribe(() => this.reload());
  }
}
