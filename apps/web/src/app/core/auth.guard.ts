import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  return auth.bootstrap().pipe(map(() => (auth.isAuthenticated() ? true : router.parseUrl('/login'))));
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return router.parseUrl('/app');
  return auth.bootstrap().pipe(map(() => (auth.isAuthenticated() ? router.parseUrl('/app') : true)));
};
