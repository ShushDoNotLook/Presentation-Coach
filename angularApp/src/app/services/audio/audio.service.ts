// audio.service.ts

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private microphoneStream!: MediaStream;

  constructor() {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
  }

  start(): Observable<Float32Array> {
    return new Observable<Float32Array>((observer) => {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          this.microphoneStream = stream;
          const source = this.audioContext.createMediaStreamSource(stream);
          source.connect(this.analyser);

          const dataArray = new Float32Array(this.analyser.fftSize);
          const sampleRate = this.audioContext.sampleRate;

          const updateData = () => {
            this.analyser.getFloatTimeDomainData(dataArray);
            observer.next(dataArray);
            requestAnimationFrame(updateData);
          };
          updateData();
        })
        .catch((err) => {
          console.error('Error accessing microphone:', err);
          observer.error(err);
        });
    });
  }

  stop() {
    if (this.microphoneStream) {
      this.microphoneStream.getTracks().forEach(track => track.stop());
    }
  }
}