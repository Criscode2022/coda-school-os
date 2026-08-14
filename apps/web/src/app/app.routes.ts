import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { guestGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'students',
        loadComponent: () => import('./pages/students/students.component').then((m) => m.StudentsComponent),
      },
      {
        path: 'faculty',
        loadComponent: () => import('./pages/faculty/faculty.component').then((m) => m.FacultyComponent),
      },
      {
        path: 'schedule',
        loadComponent: () => import('./pages/schedule/schedule.component').then((m) => m.ScheduleComponent),
      },
      {
        path: 'rooms',
        loadComponent: () => import('./pages/rooms/rooms.component').then((m) => m.RoomsComponent),
      },
      {
        path: 'tuition',
        loadComponent: () => import('./pages/tuition/tuition.component').then((m) => m.TuitionComponent),
      },
      {
        path: 'instruments',
        loadComponent: () => import('./pages/instruments/instruments.component').then((m) => m.InstrumentsComponent),
      },
      {
        path: 'recitals',
        loadComponent: () => import('./pages/recitals/recitals.component').then((m) => m.RecitalsComponent),
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings.component').then((m) => m.SettingsComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
