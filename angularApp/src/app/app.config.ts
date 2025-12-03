import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch()),
    importProvidersFrom(provideFirebaseApp(() => initializeApp({
        "projectId": "ai-presentation-coach-3435c",
        "appId": "1:651458686672:web:41478b273bee0033f178d5",
        "databaseURL": "https://ai-presentation-coach-3435c-default-rtdb.firebaseio.com",
        "storageBucket": "ai-presentation-coach-3435c.appspot.com",
        // "locationId":"us-west2",
        "apiKey": "AIzaSyCKydZZwDJKEoINHVsWZwvSD6K8y1it9iY",
        "authDomain": "ai-presentation-coach-3435c.firebaseapp.com",
        "messagingSenderId": "651458686672"
    }))),
    importProvidersFrom(provideAuth(() => getAuth())),
    importProvidersFrom(provideDatabase(() => getDatabase())),
    importProvidersFrom(provideStorage(() => getStorage())),
    provideAnimations(),
    provideAnimations()
]
};
