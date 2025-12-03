import { Component, Input, SimpleChanges, inject, HostListener } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NgFor } from '@angular/common';
import {MatListModule} from '@angular/material/list';
import {MatRippleModule} from '@angular/material/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import {MatTooltipModule} from '@angular/material/tooltip';

import { PresentationService } from '../../services/presentation/presentation.service';
import { VoiceRecognitionService } from '../../services/voice-recognition/voice-recognition.service';

@Component({
  selector: 'app-slides-carousel',
  standalone: true,
  imports: [MatCardModule, MatSidenavModule, NgFor, MatListModule, MatRippleModule, MatIconModule, MatButtonModule, MatDividerModule, MatTooltipModule],
  templateUrl: './slides-carousel.component.html',
  styleUrl: './slides-carousel.component.css'
})
export class SlidesCarouselComponent {
  
  presentationService: PresentationService = inject(PresentationService);
  voiceRecognitionService: VoiceRecognitionService = inject(VoiceRecognitionService);
  
  @Input() slides: string[] = [];
  currentSlide = 0;
  currentSlideImage = "";

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['slides']) {
      this.currentSlide = 0; // set slide to 0 if user clicks off this page and comes back
      this.currentSlideImage = this.slides[this.currentSlide];
    }
  }
  
  changeSlide(slideNumber: number) {
    this.currentSlide = slideNumber;
    this.currentSlideImage = this.slides[this.currentSlide];
  }

  @HostListener('document:keydown.enter', ['$event'])
  nextSlideEnter() {
    if (this.currentSlide < this.slides.length - 1) {
      // Save Current Slide Transcript
      if (this.voiceRecognitionService.recording) {
        this.voiceRecognitionService.saveSlideTranscript(this.currentSlide);
      }

      this.currentSlide += 1;
    }

    this.currentSlideImage = this.slides[this.currentSlide];
  }

  @HostListener('document:keydown.arrowright', ['$event'])
  nextSlide() {
    if (this.currentSlide < this.slides.length - 1) {
      // Save Current Slide Transcript
      if (this.voiceRecognitionService.recording) {
        this.voiceRecognitionService.saveSlideTranscript(this.currentSlide);
      }

      this.currentSlide += 1;
    }

    this.currentSlideImage = this.slides[this.currentSlide];
  }

  @HostListener('document:keydown.arrowleft', ['$event'])
  prevSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide -= 1;
    }

    this.currentSlideImage = this.slides[this.currentSlide];
  }

  
}
