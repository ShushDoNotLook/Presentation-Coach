import { Component, inject, OnInit } from '@angular/core';
import { ProgressSpinnerMode, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ThemePalette } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { PresentationService } from '../../services/presentation/presentation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FeedbackService } from '../../services/feedback/feedback.service';
import { MatButtonModule } from '@angular/material/button';
import { NgFor, CommonModule } from '@angular/common';

interface SlideFeedback {
  imageUrl: string;
  feedback: any;
}

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatCardModule, MatIconModule, MatDividerModule, MatButtonModule, NgFor],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.css'
})
export class FeedbackComponent {

  router: Router = inject(Router);
  presentationService: PresentationService = inject(PresentationService);
  feedbackService: FeedbackService = inject(FeedbackService)
  activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  Object = Object;
  Number = Number;

  regenerating = false;

  color: ThemePalette = 'warn';
  mode: ProgressSpinnerMode = 'determinate';
  value = 50;

  improvements: string = '';
  audience: string = '';

  currentSlideIndex: number = 0;
  sessionId: string = '';

  positive_feedback = "example";
  improvement_feedback = "example";

  nextSlide(): void {
    if (this.presentationService.currentPresentation && this.presentationService.currentPresentation.slidesWithFeedback) {
      const length = this.presentationService.currentPresentation.slidesWithFeedback.length;
      if (this.currentSlideIndex < length - 1) {
        this.currentSlideIndex++;
      } else {
        this.currentSlideIndex = 0; // Wrap to the first slide
      }
    }
  }

  prevSlide(): void {
    if (this.presentationService.currentPresentation && this.presentationService.currentPresentation.slidesWithFeedback) {
      const length = this.presentationService.currentPresentation.slidesWithFeedback.length;
      if (this.currentSlideIndex > 0) {
        this.currentSlideIndex--;
      } else {
        this.currentSlideIndex = length - 1; // Wrap around to the last slide
      }
    }
  }

  async feedbackFunction() { // this is for regenerating the feedback, implement later.
    //   this.regenerating = true;
    //   try {
    //     // Example: Start a new session each time feedback is generated
    //     const sessionNumber = await this.presentationService.startNewFeedbackSession();
    //     await this.feedbackService.generateFeedback(sessionNumber);
    //   } catch (error) {
    //     console.error("Error generating feedback:", error);
    //     // Handle error appropriately...
    //   }
    //   this.regenerating = false;
  }

  async practiceAgain() {
    await this.router.navigateByUrl(`/present/${this.presentationService.currentPresentation?.id}`)
  }
}