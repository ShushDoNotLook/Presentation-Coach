import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { CanActivateFn } from '@angular/router';
import { UserAuthService } from '../services/auth/user-auth.service';
import { PresentationService } from '../services/presentation/presentation.service';

export const userAuthGuard: CanActivateFn = async (route, state) => {
  
  const router = inject(Router);
  const auth = inject(UserAuthService);
  const presentationService = inject(PresentationService)

  const userLoggedIn = await auth.loggedIn();

  if (userLoggedIn) {

    try {
      await presentationService.loadUserPresentations();
    } catch (error) {
      console.log(error)
    }

    return true;
  } else {
    router.navigate(['/register']);
    return false;
  }
};
