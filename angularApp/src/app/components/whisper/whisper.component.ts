import { Component, OnDestroy, OnInit, inject, HostListener } from '@angular/core';
import { VoiceRecognitionService } from '../../services/voice-recognition/voice-recognition.service';
import { NgIf, CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { AudioService } from '../../services/audio/audio.service';
import { Subscription } from 'rxjs';
import { PresentationService } from '../../services/presentation/presentation.service';
import { FeedbackService } from '../../services/feedback/feedback.service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NgFor } from '@angular/common';
import {MatListModule} from '@angular/material/list';
import {MatRippleModule} from '@angular/material/core';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SlidesCarouselComponent } from '../slides-carousel/slides-carousel.component';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
  selector: 'app-whisper',
  standalone: true,
  imports: [NgIf, MatButtonModule, CommonModule, MatCardModule, MatSidenavModule, NgFor, MatListModule, MatRippleModule, MatIconModule, MatButtonModule, MatDividerModule, MatExpansionModule, MatProgressBarModule, SlidesCarouselComponent, MatTooltipModule],
  templateUrl: './whisper.component.html',
  styleUrls: ['./whisper.component.css'],

})
export class WhisperComponent implements OnInit, OnDestroy {
  feedbackService: FeedbackService = inject(FeedbackService);
  router: Router = inject(Router);
  recording = false;
  showWaveform: boolean = false;
  showInstructions: boolean = false;
  submitting = false;
  // timer
  currentTime: string = '0:00';
  totalSeconds: number = 0;
  timerActive: boolean = false;
  timerInterval: any;

  private audioDataSubscription!: Subscription;
  waveform!: Float32Array;
  audioCaptureStarted: boolean = false;

  // Todo: Move everything not related to the whisper component out of the component
  panelOpenState = false;

  constructor(
    public speechToText: VoiceRecognitionService,
    private audioService: AudioService,
    public presentationService: PresentationService
  ) {
    if (this.speechToText.isAvailable()) {
      this.speechToText.init()
    }
  }

  @HostListener('document:keydown.space', ['$event'])
  onSpace(event: KeyboardEvent) {
    if (this.showWaveform) {
      event.preventDefault();
      this.toggleRecording();
    }
  }

  showRecordingUI() {
    this.showWaveform = true;
  }

  toggleRecording() {
    if (this.recording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  startRecording() {
    this.recording = true;
    this.startSpeechService()
    this.startAudioWaveformCapture()
    this.startTimer()
  }

  stopRecording() {
    this.recording = false;
    this.stopSpeechService()
    this.stopAudioWaveformCapture()
    this.stopTimer()
  }

  startSpeechService() {
    if (this.speechToText.isAvailable()) {
      this.speechToText.start()
      this.recording = true;
    } else {
      alert("Firefox and Opera browsers do not support the Web Speech API; please use a different browser.")
    }

  }

  async stopSpeechService() {

    if (this.speechToText.isAvailable()) {
      await this.speechToText.stop()
      this.recording = false;
    } else {
      alert("Firefox and Opera browsers do not support the Web Speech API; please use a different browser.")
    }
  }

  // TODO: Move this function out of the component (into a service because of separation of concerns)
  async submitPracticeSession() {
    try {
      if (!this.presentationService.currentPresentation) {
        return;
      }
      const presentationID = this.presentationService.currentPresentation.id as string

      this.submitting = true
      // Submitting variable
      await this.feedbackService.generateFeedback();
      this.submitting = false
      // Complete Submission Variable
      const sessionID = await this.presentationService.completeSession(presentationID);

      await this.presentationService.loadUserPresentations();

      await this.router.navigateByUrl(`/feedback/${presentationID}/session/${sessionID}`)
    } catch (error: any) {
      // TODO: Show errors in UI
      console.log(error)
      this.submitting = false
      throw error;
    }
  }

  startTimer() {
    this.currentTime = '0:00';
    this.timerActive = true;
    this.timerInterval = setInterval(() => {
      this.totalSeconds++;
      const minutes = Math.floor(this.totalSeconds / 60);
      const seconds = this.totalSeconds % 60;
      this.currentTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timerInterval);
    this.totalSeconds = 0;
    this.timerActive = false;
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.stopAudioWaveformCapture();
    clearInterval(this.timerInterval);
  }

  startAudioWaveformCapture() {
    if (!this.audioCaptureStarted) {
      this.audioDataSubscription = this.audioService.start().subscribe((data: Float32Array) => {
        this.waveform = data;
      });
      this.audioCaptureStarted = true;
    }
  }

  stopAudioWaveformCapture() {
    if (this.audioCaptureStarted) {
      this.audioService.stop();
      if (this.audioDataSubscription) {
        this.audioDataSubscription.unsubscribe();
      }
      this.audioCaptureStarted = false;
    }
  }

  generatePath(data: Float32Array): string {
    let path = 'M0,0';
    const width = 1000; // Adjust as needed
    const height = 300; // Adjust as needed

    if (data) {
      const sliceWidth = width * 1.0 / data.length;

      let x = 0;
      for (let i = 0; i < data.length; i++) {
        const y = (data[i] + 1) * height / 2;
        path += ` L${x},${y}`;
        x += sliceWidth;
      }
    }


    return path;
  }
}
