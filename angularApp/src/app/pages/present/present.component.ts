import { Component, OnInit } from '@angular/core';
import { SlidesCarouselComponent } from '../../components/slides-carousel/slides-carousel.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { CommonModule } from '@angular/common';
import { PresentationService } from '../../services/presentation/presentation.service';
import {WhisperComponent} from "../../components/whisper/whisper.component";

@Component({
  selector: 'app-present',
  standalone: true,
  imports: [SlidesCarouselComponent, DashboardComponent, CommonModule, WhisperComponent],
  templateUrl: './present.component.html',
  styleUrl: './present.component.css'
})
export class PresentComponent {
  constructor(public presentationService: PresentationService) { }
}
