import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytes } from '@angular/fire/storage';
import { UserAuthService } from '../auth/user-auth.service';
import { HttpClient } from '@angular/common/http';
import { PresentationService } from '../presentation/presentation.service';

@Injectable({
  providedIn: 'root'
})
export class SlidesService {

  constructor(
    private http: HttpClient,
  ) { }

  public async PPTXToImage(slides: File, presentationID: string) {
    try {
      const formData = new FormData();
      formData.append('file', slides);
      formData.append('presentationID', presentationID);

      const response: any = await this.http.post("https://us-central1-ecoach-413504.cloudfunctions.net/CONVERSION_URL", formData).toPromise(); // BE AWARE THIS IS A NEW URL, OLD ONE IS CONVERSION_FINAL, PLEASE USE CONVERSION_URL INSTEAD

      // Check if the response contains the list of image URLs
      if (response && Array.isArray(response)) {
        const imageUrls: string[] = response;

        // double check
        console.log("IMAGEURLS: ", imageUrls);

        return imageUrls
      } else {
        console.error("Invalid response format: No imageUrls found.");
      }
    } catch (error) {
      console.error("Error converting PPTX to images:", error);
    }
  
    return []

  }
}

