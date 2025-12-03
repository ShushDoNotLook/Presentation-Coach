import { Injectable } from '@angular/core';
import {Database, ref, get, update} from '@angular/fire/database';
import { UserAuthService } from '../auth/user-auth.service';
import {PresentationService} from "../presentation/presentation.service";

declare var webkitSpeechRecognition: any;

@Injectable({
  providedIn: 'root'
})
export class VoiceRecognitionService {
  recognition: undefined | any = undefined;
  isStoppedSpeechRecog = false;
  recording = false;
  public text = '';
  tempWords = '';

  constructor(private presentationService: PresentationService) {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new webkitSpeechRecognition();
    } else {
      // The browser does not support the Web Speech API
      console.log("Firefox and Opera browsers do not support the Web Speech API, please use a different browser");
    }
  }

  clear() {
    this.text = '';
    this.tempWords = '';
  }

  isAvailable() {
    return this.recognition !== undefined;
  }

  init() {
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.addEventListener('result', (e: any) => {
      const transcript = Array.from(e.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      this.tempWords = transcript;
      // console.log(transcript);
    });
  }

  start() {
    this.text = ''
    this.tempWords = ''
    this.isStoppedSpeechRecog = false;
    this.recording = true;
    this.recognition.start();
    console.log("Speech recognition started");
    this.recognition.addEventListener('end', () => {
      if (this.isStoppedSpeechRecog) {
        // this.recognition.stop();
        console.log("End speech recognition");
      } else {
        this.wordConcat();
        this.recognition.start();
      }
    });
  }

  async stop() {
    this.recording = false;
    this.isStoppedSpeechRecog = true;
    this.recognition.stop();
    await this.finalText();
  }

  wordConcat() {
    this.text += ' ' + this.tempWords + '.';
    this.tempWords = '';
  }

  async finalText() {
    try {
      console.log('Final text:', this.text);

      await this.presentationService.addTranscript(this.text, 100);

      console.log("Transcription saved to database");

    } catch (error) {
      console.error("Error saving transcription:", error);
    }
  }

  async saveSlideTranscript(slideNumber: number) {
    try {
      console.log('Slide transcript:', this.text);

      await this.presentationService.addTranscript(this.text, slideNumber);

      console.log("Slide transcript saved to database");
      // Clear the text after saving
      this.text = '';


    } catch (error) {
      console.error("Error saving slide transcript:", error);
    }
  }

}
