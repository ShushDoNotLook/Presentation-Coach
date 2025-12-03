import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { PresentationService } from '../services/presentation/presentation.service';

export const pageDeactivateGuard: CanDeactivateFn<unknown> = (component, currentRoute, currentState, nextState) => {
  if (confirm("Are you sure you want to leave this page? You will lose your progress on this session!")) {
    const presentationService = inject(PresentationService)
    // clear transcript generated during the session
    presentationService.clearCurrentTranscript();
    // whisper component already destroys itself and stops speech recognition when page is deactivated
    // no need to do that here
    return true;
  }

  return false;
};
