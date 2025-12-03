import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { Database, ref, set, push, get, remove, update } from '@angular/fire/database';
import { UserAuthService } from '../auth/user-auth.service';
import { SlidesService } from '../slides/slides.service';
// import { create } from 'cypress/types/lodash';s

type feedback = {
  [slideNumber: number]: {
    score: number,
    positive_feedback: string,
    areas_of_improvement: string
  }
}

type transcription = { [slideNumber: number]: string }

interface SlideFeedback {
  imageUrl: string;
  feedback: any; 
  transcript?: string;
}

export interface IPresentation {
  name: string,
  improvements: string,
  audience: string,
  sessions?: {
    [sessionID: string]: {
      feedback: feedback,
      transcription: transcription,
      createdAt: string,
      id: string
    }
  }
  feedback?: feedback,
  id?: string,
  images?: string[],
  transcription?: transcription
  sessionId?: string; 
  slidesWithFeedback?: SlideFeedback[]; 
}

export interface IWipPresentation {
  id: string,
  images: string[],
  name: string
}

interface IPresentationDict {
  [presentationID: string]: IPresentation
}

@Injectable({
  providedIn: 'root'
})
export class PresentationService {

  private database: Database = inject(Database);
  private user: UserAuthService = inject(UserAuthService);
  private slidesService: SlidesService = inject(SlidesService);

  public userPresentations: WritableSignal<IPresentationDict> = signal({});
  public wipPreviewImage = ""
  public wipFileName = ""
  public sessionId = ""
  public currentPresentation: IPresentation | undefined = undefined
  public sessionFeedback: feedback | undefined = undefined;
  public slidesWithFeedback: SlideFeedback[] | undefined = undefined

  // Call this method to set the new current presentation (HANDLED BY DASHBOARD WHEN ROUTE CHANGES)
  async setCurrentPresentation(presentationID: string) {
    this.currentPresentation = this.userPresentations()[presentationID];
  }

  // Public method to store images in a WIP Presentation, until user submits thier presentation form
  async wipPresentation(pptxFile: File) {
    try {
      const userID = await this.user.userID();

      const userWipPresentationRef = ref(this.database, `user/${userID}/presentations/wip`)

      let uniquePresentationID = push(userWipPresentationRef).key;

      // Check if wip presentation already exists, if yes override images -> else create new data model
      await get(userWipPresentationRef).then((dataSnapshot) => {
        if (dataSnapshot.exists()) {
          const wipPresentation = dataSnapshot.val();
          if (wipPresentation.id) {
            uniquePresentationID = wipPresentation.id
          }
        }
      })

      const image_urls = await this.slidesService.PPTXToImage(pptxFile, uniquePresentationID as string);

      const wipPresentation = { id: uniquePresentationID, images: image_urls, name: pptxFile.name }

      await set(
        ref(this.database, `user/${userID}/presentations/wip`),
        wipPresentation
      )

    } catch (error) {
      return Promise.reject(error)
    }
  }

  // Public method to add a new presentation into the user presentation object
  async addPresentation(presentation: IPresentation): Promise<string> {

    try {
      const userID = await this.user.userID();

      const userWipPresentationRef = ref(this.database, `user/${userID}/presentations/wip`)

      let uniquePresentationID = ""
      // Check if wip presentation already exists, if yes write to DB, else error
      const dataSnapshot = await get(userWipPresentationRef)

      if (!dataSnapshot.exists()) {
        return Promise.reject("Haven't Started Creating Presentation")
      }

      const wipPresentation = dataSnapshot.val();

      if (!wipPresentation.id || !wipPresentation.images) {
        return Promise.reject("No Slide Deck Uploaded")
      }

      uniquePresentationID = wipPresentation.id

      await set(ref(this.database, `user/${userID}/presentations/${uniquePresentationID}`),
        { ...presentation, id: uniquePresentationID, images: wipPresentation.images })

      if (uniquePresentationID == "") {
        return Promise.reject("error creating presentation")
      }

      await remove(userWipPresentationRef)

      this.wipPreviewImage = ""
      this.wipFileName = ""

      return uniquePresentationID

    } catch (error) {
      return Promise.reject(error)
    }
  }

  // Public method to load the user's presentations into the frontend.
  async loadUserPresentations() {
    this.userPresentations.set(await this.getPresentations());
  }

  // Helper method to get the user's saved presentations
  private async getPresentations(): Promise<IPresentationDict> {
    try {
      const userID = await this.user.userID();

      const userPresentationsRef = ref(this.database, `user/${userID}/presentations/`)

      let userPresentations: IPresentationDict = {}

      await get(userPresentationsRef).then((dataSnapshot) => {
        if (dataSnapshot.exists()) {
          userPresentations = dataSnapshot.val();

          const userWip = userPresentations['wip']

          if (userWip) {

            if (userWip.images) {
              this.wipPreviewImage = userWip.images[0]
              this.wipFileName = userWip.name
            }

            delete userPresentations['wip']
          }

        }
      })
      return userPresentations
    } catch (error) {
      return Promise.reject(error)
    }
  }

  public async addFeedback(text: any, slideNumber: number) {
    try {
      const userID = await this.user.userID();

      const feedbackRef = ref(this.database, `/user/${userID}/presentations/${this.currentPresentation?.id}/feedback`)

      if (this.currentPresentation) {
        await update(feedbackRef, { [slideNumber]: text })
        this.currentPresentation.feedback = text

        await get(feedbackRef).then((dataSnapshot) => {
          if (this.currentPresentation)
            this.currentPresentation.feedback = dataSnapshot.val();
        });
      } else {
        Promise.reject("No Presentation Set")
      }

    } catch (error) {
      console.log(error)
      Promise.reject(error)
    }
  }

  public async addTranscript(text: string, slideNumber: number) {
    const userID = await this.user.userID();
    console.log('User ID:', userID);

    if (!this.currentPresentation || !this.currentPresentation?.id) {
      console.error('Current presentation is undefined or lacks an ID');
      return Promise.reject('Current presentation is undefined or lacks an ID')
    }

    const presentationRef = ref(this.database, `user/${userID}/presentations/${this.currentPresentation?.id}/transcription`);

    // if need created at date
    //await push(presentationRef, { text: this.text, createdAt: new Date().toISOString() });
    await update(presentationRef, { [slideNumber]: text });

    await get(presentationRef).then((dataSnapshot) => {
      if (this.currentPresentation)
        this.currentPresentation.transcription = dataSnapshot.val();
    });
  }

  public async clearCurrentTranscript() {
    if (this.currentPresentation?.transcription != undefined) {
      this.currentPresentation.transcription = undefined;
    }
  }

  public async completeSession(presentationID: string) {
    try {
      const userID = await this.user.userID();
      const presentationRef = ref(this.database, `user/${userID}/presentations/${presentationID}`)
      const presentationSnapshot = await get(presentationRef);
      const presentation = presentationSnapshot.val();

      // Get the feedback and transcript
      const feedback = presentation.feedback;
      const transcription = presentation.transcription;

      // Create new session data with these
      const sessionRef = ref(this.database, `user/${userID}/presentations/${presentationID}/sessions`)

      const sessionID = push(presentationRef).key as string;
      const createdAt =  new Date()
      await update(sessionRef, {
        [sessionID]: {
          feedback,
          transcription,
          id: sessionID,
          createdAt: createdAt.toLocaleString()
        }
      });

      const sessionData = {
        feedback,
        transcription,
        createdAt: createdAt.toLocaleDateString(),
        id: sessionID
      };

      if (this.currentPresentation && this.currentPresentation.id === presentationID) {
        if (!this.currentPresentation.sessions) {
            this.currentPresentation.sessions = {};
        }
        this.currentPresentation.sessions[sessionID] = sessionData;
      }

      // Clear Feedback and Transcript
      const feedbackRef = ref(this.database, `user/${userID}/presentations/${presentationID}/feedback`)
      const transcriptRef = ref(this.database, `user/${userID}/presentations/${presentationID}/transcription`)
      await remove(feedbackRef);
      await remove(transcriptRef);

      return sessionID;

    } catch (error) {
      // TODO: SHOW ERROR
      Promise.reject("Error Saving Session" + error);
      return;
    }
  }

  async prepareSessionFeedback(sessionId: string): Promise<void> {
    console.log("TRANSCRIPT: ", this.currentPresentation?.transcription);
    // DONE: retrieve session from current presentation instead of DB
    if (!this.currentPresentation || !this.currentPresentation.id) {
      throw new Error("Current presentation ID is undefined.");
    }
    if (this.currentPresentation.sessions && this.currentPresentation.sessions[sessionId] && this.currentPresentation.sessions[sessionId].feedback) {
      const feedbackData = this.currentPresentation.sessions[sessionId].feedback;
      const slidesWithFeedback = await this.prepareSlidesData(feedbackData, sessionId);
      
      this.currentPresentation.sessionId = sessionId; 
      this.currentPresentation.slidesWithFeedback = slidesWithFeedback; 
    } else {
      console.log("No feedback found for session", sessionId);
    }
  }

  async prepareSlidesData(feedback: feedback, sessionId: string) {
    const images = this.currentPresentation?.images || []; 
    let transcripts: transcription = {};

  if (this.currentPresentation && this.currentPresentation.sessions && this.currentPresentation.sessions[sessionId]) {
    transcripts = this.currentPresentation.sessions[sessionId].transcription || {};
  }
    let slidesWithFeedback: SlideFeedback[] = [];
    slidesWithFeedback = images.map((imageUrl, index) => {
        const slideFeedback = feedback[index];
        const slideTranscript = transcripts[index]; 
        return {
            imageUrl,
            feedback: slideFeedback,
            transcript: slideTranscript || "Transcript not available"
        };
    });
    console.log("Slides Feedback and Transcripts: ", slidesWithFeedback);
    return slidesWithFeedback;
}
}
