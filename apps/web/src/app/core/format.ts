export function money(value: string | number | null | undefined, currency = 'EUR'): string {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
}

export function labelize(value: string | null | undefined): string {
  if (!value) return '';
  return value.replace(/_/g, ' ');
}

export function dateLabel(value: string | null | undefined): string {
  if (!value) return '';
  const d = new Date(value.includes('T') ? value : `${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function badgeClass(status: string): string {
  switch (status) {
    case 'active':
    case 'paid':
    case 'completed':
    case 'available':
    case 'confirmed':
    case 'done':
      return 'badge bg-forest-100 text-forest-800';
    case 'overdue':
    case 'no_show':
    case 'repair':
    case 'cancelled':
      return 'badge bg-red-100 text-red-800';
    case 'partial':
    case 'paused':
    case 'on_leave':
    case 'scheduled':
    case 'planned':
    case 'rented':
      return 'badge bg-ink-100 text-ink-700';
    default:
      return 'badge bg-ink-100 text-ink-600';
  }
}
