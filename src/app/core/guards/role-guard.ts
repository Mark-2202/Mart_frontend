import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformServer } from '@angular/common';
import { Auth } from '../services/auth';

export const roleGuard: CanActivateFn = (route, state) => {
  const platformId = inject(PLATFORM_ID);
  if (isPlatformServer(platformId)) {
    return true;
  }

  const authService = inject(Auth);
  const router = inject(Router);

  const allowedRoles = route.data?.['roles'] as Array<string>;

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (authService.isLoggedIn() && authService.hasRole(allowedRoles)) {
    return true;
  }

  if (authService.isLoggedIn()) {
    alert('Access Denied: You do not have permissions to access this page.');
    // Fallback page
    router.navigate(['/pos']);
  } else {
    router.navigate(['/login']);
  }
  return false;
};
