import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  AuthResponse,
  DashboardSummary,
  Enrollment,
  Instrument,
  Invoice,
  Lesson,
  Recital,
  Room,
  Student,
  Teacher,
  User,
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api';

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.base}/auth/login`, { email, password });
  }
  register(payload: { email: string; password: string; name: string; company?: string }) {
    return this.http.post<AuthResponse>(`${this.base}/auth/register`, payload);
  }
  me() {
    return this.http.get<User>(`${this.base}/auth/me`);
  }
  updateProfile(payload: Partial<User>) {
    return this.http.patch<User>(`${this.base}/auth/me`, payload);
  }
  dashboard() {
    return this.http.get<DashboardSummary>(`${this.base}/dashboard`);
  }

  listStudents(q?: string, status?: string) {
    let p = new HttpParams();
    if (q) p = p.set('q', q);
    if (status) p = p.set('status', status);
    return this.http.get<Student[]>(`${this.base}/students`, { params: p });
  }
  createStudent(body: Record<string, unknown>) {
    return this.http.post<Student>(`${this.base}/students`, body);
  }
  updateStudent(id: string, body: Record<string, unknown>) {
    return this.http.patch<Student>(`${this.base}/students/${id}`, body);
  }
  deleteStudent(id: string) {
    return this.http.delete(`${this.base}/students/${id}`);
  }

  listTeachers() {
    return this.http.get<Teacher[]>(`${this.base}/teachers`);
  }
  createTeacher(body: Record<string, unknown>) {
    return this.http.post<Teacher>(`${this.base}/teachers`, body);
  }
  updateTeacher(id: string, body: Record<string, unknown>) {
    return this.http.patch<Teacher>(`${this.base}/teachers/${id}`, body);
  }
  deleteTeacher(id: string) {
    return this.http.delete(`${this.base}/teachers/${id}`);
  }

  listRooms() {
    return this.http.get<Room[]>(`${this.base}/rooms`);
  }
  createRoom(body: Record<string, unknown>) {
    return this.http.post<Room>(`${this.base}/rooms`, body);
  }
  updateRoom(id: string, body: Record<string, unknown>) {
    return this.http.patch<Room>(`${this.base}/rooms/${id}`, body);
  }
  deleteRoom(id: string) {
    return this.http.delete(`${this.base}/rooms/${id}`);
  }

  listLessons(from?: string, to?: string, status?: string) {
    let p = new HttpParams();
    if (from) p = p.set('from', from);
    if (to) p = p.set('to', to);
    if (status) p = p.set('status', status);
    return this.http.get<Lesson[]>(`${this.base}/lessons`, { params: p });
  }
  createLesson(body: Record<string, unknown>) {
    return this.http.post<Lesson>(`${this.base}/lessons`, body);
  }
  updateLesson(id: string, body: Record<string, unknown>) {
    return this.http.patch<Lesson>(`${this.base}/lessons/${id}`, body);
  }
  deleteLesson(id: string) {
    return this.http.delete(`${this.base}/lessons/${id}`);
  }

  listEnrollments() {
    return this.http.get<Enrollment[]>(`${this.base}/enrollments`);
  }
  createEnrollment(body: Record<string, unknown>) {
    return this.http.post<Enrollment>(`${this.base}/enrollments`, body);
  }

  listInvoices(status?: string) {
    let p = new HttpParams();
    if (status) p = p.set('status', status);
    return this.http.get<Invoice[]>(`${this.base}/invoices`, { params: p });
  }
  createInvoice(body: Record<string, unknown>) {
    return this.http.post<Invoice>(`${this.base}/invoices`, body);
  }
  updateInvoice(id: string, body: Record<string, unknown>) {
    return this.http.patch<Invoice>(`${this.base}/invoices/${id}`, body);
  }
  generateInvoices() {
    return this.http.post<{ created: number; period: string }>(`${this.base}/invoices/generate`, {});
  }

  listInstruments() {
    return this.http.get<Instrument[]>(`${this.base}/instruments`);
  }
  createInstrument(body: Record<string, unknown>) {
    return this.http.post<Instrument>(`${this.base}/instruments`, body);
  }
  updateInstrument(id: string, body: Record<string, unknown>) {
    return this.http.patch<Instrument>(`${this.base}/instruments/${id}`, body);
  }
  deleteInstrument(id: string) {
    return this.http.delete(`${this.base}/instruments/${id}`);
  }

  listRecitals() {
    return this.http.get<Recital[]>(`${this.base}/recitals`);
  }
  createRecital(body: Record<string, unknown>) {
    return this.http.post<Recital>(`${this.base}/recitals`, body);
  }
  addPiece(recitalId: string, body: Record<string, unknown>) {
    return this.http.post<Recital>(`${this.base}/recitals/${recitalId}/pieces`, body);
  }
}
