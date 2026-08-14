export interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  phone: string;
  taxId: string;
  currency: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthdate: string | null;
  guardian_name: string;
  guardian_phone: string;
  level: string;
  primary_instrument: string;
  status: string;
  notes: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  instruments: string;
  hourly_rate: string | number;
  status: string;
  bio: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  has_piano: boolean;
  notes: string;
}

export interface Lesson {
  id: string;
  student_id: string;
  teacher_id: string;
  room_id: string | null;
  instrument: string;
  lesson_date: string;
  start_time: string;
  duration_min: number;
  status: string;
  notes: string;
  student_name?: string;
  teacher_name?: string;
  room_name?: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  student_name?: string;
  plan: string;
  monthly_fee: string | number;
  start_date: string;
  status: string;
  notes: string;
}

export interface Invoice {
  id: string;
  student_id: string;
  student_name?: string;
  enrollment_id: string | null;
  number: string;
  period_label: string;
  amount: string | number;
  status: string;
  due_date: string;
  paid_at: string | null;
  notes: string;
}

export interface Instrument {
  id: string;
  name: string;
  type: string;
  serial: string;
  condition: string;
  status: string;
  monthly_rate: string | number;
  student_id: string | null;
  student_name?: string;
  notes: string;
}

export interface RecitalPiece {
  id: string;
  student_id: string;
  student_name?: string;
  piece: string;
  composer: string;
  order_index: number;
}

export interface Recital {
  id: string;
  title: string;
  venue: string;
  recital_date: string;
  program_notes: string;
  status: string;
  pieces: RecitalPiece[];
}

export interface DashboardSummary {
  kpis: {
    activeStudents: number;
    teachers: number;
    rooms: number;
    todayLessons: number;
    monthlyTuition: number;
    collectedThisMonth: number;
    overdue: number;
    rentedInstruments: number;
  };
  todaySchedule: Lesson[];
  collectedByMonth: { month: string; total: number }[];
  recentActivity: { kind: string; title: string; at: string; meta: string; context: string }[];
  upcomingRecital: Recital | null;
  dbSource: 'neon' | 'pglite';
}
