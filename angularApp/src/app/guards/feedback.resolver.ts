import { ResolveFn } from '@angular/router';
import { PresentationService } from '../services/presentation/presentation.service';
import { inject } from '@angular/core';

export const feedbackResolver: ResolveFn<boolean> = async (route, state) => {
  const presentationService: PresentationService = inject(PresentationService);
  const presentationID = route.url[1].path;
  await presentationService.setCurrentPresentation(presentationID);
  

  let sessionID = route.paramMap.get('sessionId');
  if (sessionID) {
    await presentationService.prepareSessionFeedback(sessionID);
  }
  return true;
};
