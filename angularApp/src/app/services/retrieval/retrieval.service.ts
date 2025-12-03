import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Retrieval {
  constructor(private http: HttpClient) {}

  async getImageUrls(presentationId: string): Promise<string[]> {
    try {
      const url = `https://us-central1-ecoach-413504.cloudfunctions.net/RETRIEVAL_TEST?presentationId=${presentationId}`;
      const response = await this.http.get(url, { responseType: 'text' }).toPromise();
      if (response) {
        // Split the response by newline character to get individual URLs
        const imageUrls = response.split('\n');
        return imageUrls.filter(url => !!url.trim()); // Filter out empty URLs
      } else {
        console.error('Empty response received.');
        return [];
      }
    } catch (error) {
      console.error('Error fetching image URLs:', error);
      throw error;
    }
  }
}