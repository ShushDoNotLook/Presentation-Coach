import { ResolveFn } from '@angular/router';
import { PresentationService } from '../services/presentation/presentation.service';
import { inject } from '@angular/core';
import { VoiceRecognitionService } from '../services/voice-recognition/voice-recognition.service';

export const presentResolver: ResolveFn<boolean> = async (route, state) => {
  const presentationService: PresentationService = inject(PresentationService);
  const voiceRecognitionService: VoiceRecognitionService = inject(VoiceRecognitionService)
  const presentationID = route.url[1].path;
  await presentationService.setCurrentPresentation(presentationID);
  voiceRecognitionService.clear();
  return true;
};
