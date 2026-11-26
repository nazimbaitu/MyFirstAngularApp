import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ApiService, apiErrorMessage } from '../services/api.service';
import { DataService } from '../services/data.service';

export const authGuard: CanActivateFn = () => {
  const api = inject(ApiService);
  const data = inject(DataService);
  const router = inject(Router);

  if (!api.isAuthenticated()) return router.createUrlTree(['/login']);

  return data.loadAll(true).pipe(
    map(() => true),
    catchError(error => of(router.createUrlTree(['/login'], {
      queryParams: { error: apiErrorMessage(error) },
    }))),
  );
};
