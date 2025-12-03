import { Injectable, inject } from '@angular/core';
import { UserAuthService } from '../auth/user-auth.service';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { PresentationService } from '../presentation/presentation.service';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  private presentationService: PresentationService = inject(PresentationService);

  readonly apiKey;
  readonly genAI;
  readonly model;

  // initializes Gemini
  constructor() {
    this.apiKey = "AIzaSyCBVRtKMMG2KRuDn_swnqZI4ORdJgSTjFc";

    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-pro-vision"});
    }
    else {
      console.error('API Key not found.');
    }
  }

  // Converts a File object to a GoogleGenerativeAI.Part object.
  private async urlToGenerativePart(url: string) {
    // fetch response data from url
    const response = await fetch(url);
  
    // if fetching didn't work, throw an error
    if (!response.ok) {
      throw new Error(`Error fetching image from URL: ${response.statusText}`);
    }
  
    // get base64 version of response data
    const dataBlob = await response.blob();
    const reader = new FileReader();

    const imagePromise = new Promise((resolve) => {
      reader.addEventListener(
        "load",
        () => {
          const base64Data = reader.result;

          if (!base64Data) {
            return
          }
          const strippedBase64Data = (base64Data as string).split(";base64,")[1]
          //console.log(strippedBase64Data);

          const mimeType = 'image/png';

          // set imagePart's inlineData from strippedbase64Data and mimeType
          const imagePart: Part = {
            inlineData: { data: strippedBase64Data, mimeType },
          };

          resolve(imagePart);
        },
        false,
      )
    })

    reader.readAsDataURL(dataBlob);

    return imagePromise;
  }

  // prompts Gemini with base prompt, script, and images, and returns response
  async generateFeedback() {

    if (!this.model) {
      Promise.reject("AI Not Available");
      return;
    }

    // const prompt: string = "Given these images (slides) and the text (audio transcript), give a score from 1-10 (including 1 decimal place). This score will be higher when more of the key points from the slides are addressed in the audio transcript. This score will be lower when more filler words (such as uh, um, and like) are present in the audio transcript. Give the reasoning for this score under the headings \"Positive Feedback\" and \"Areas of Improvement\".";
    const presentation = this.presentationService.currentPresentation;

    if (!presentation) {
      Promise.reject("No Presentation Available");
      return;
    }

    const rawTranscript = presentation.transcription;
    if (!rawTranscript) {
      Promise.reject("No Transcript Available for Presentation");
      return;
    }

    const images = presentation.images;
    if (!images) {
      Promise.reject("No Images Available for Presentation");
      return;
    }

    const improvements = presentation.improvements;
    const audience = presentation.audience;

    // SLIDE BY SLIDE FEEDBACK WOULD GIVE BETTER RESPONSES
    const geminiPrompt = `I am practicing to present a very important presentation and need feedback on my performance. I want to improve ${improvements} and my audience is ${audience}. The image I've provided is a slide from my presentation slide deck. Only respond based on the presentation transcript and slide image i've provided. OUTPUT RESPONSE IN JSON FORMAT {score: number out of 10, positive_feedback: string, areas_of_improvement: string}`;


    // Loop over each slide number in the transcription, get the corresponding image, and prompt Gemini with the image and the slide's transcript
    for (const [slideNumber, slideTranscript] of Object.entries(rawTranscript)) {
      const slideNum = Number(slideNumber);
      console.log(slideNumber, slideTranscript);
      const slideImage = images[slideNum];

      if (!slideImage) {
        continue;
      }

      const imagePart = await this.urlToGenerativePart(slideImage) as Part;

      const result = await this.model.generateContent([`Slide Transcript: ${slideTranscript} ` + geminiPrompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      const strippedText = text.split("json")[1].split("```")[0];

      const json_feedback = JSON.parse(strippedText);

      console.log(json_feedback);

      await this.presentationService.addFeedback(json_feedback, slideNum);
    };

  }
}
