import { Injectable } from '@angular/core';
import { User, createUserWithEmailAndPassword, Auth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from '@angular/fire/auth';
import { Database, ref, set } from '@angular/fire/database';
@Injectable({
  providedIn: 'root'
})
export class UserAuthService {

  
  constructor(private auth: Auth, private database: Database) {

  }

  private async waitForAuthInit() {
    let unsubscribe: any;
    await new Promise<void>((resolve) => {
      unsubscribe = this.auth.onAuthStateChanged((_) => resolve());
    });
    (await unsubscribe!)();
  }

  async registerUser(email: string, password: string): Promise<User> {

    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password)
      
      await set(
      ref(this.database, 'user/' + userCredential.user.uid), 
      {
        email
      }
    )
      return userCredential.user;
    } catch (error: any) {
      const errorMessage = error.message;
      return Promise.reject(errorMessage);
    }
    
  }

  async loginUser(email: string, password: string): Promise<User> {

    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password)
      return userCredential.user;
    } catch (error: any) {
      const errorMessage = error.message;
      return Promise.reject(errorMessage);
    }
  }

  async loggedIn() {
    await this.waitForAuthInit();
    return this.auth.currentUser ? true : false
  }

  async userEmail() {
    if (await this.loggedIn()) {
      return this.auth.currentUser?.email
    } else {
      return Promise.reject('No User Logged In')
    }
  }

  async userID() {
    if (await this.loggedIn()) {
      return this.auth.currentUser?.uid;
    } else {
      return Promise.reject('No User Logged In')
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth); 
    } catch (error: any) {
      const errorMessage = error.message;
      return Promise.reject(errorMessage);
    }
  }

}
