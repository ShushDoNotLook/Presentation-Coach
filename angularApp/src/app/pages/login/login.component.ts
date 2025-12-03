import { Component, inject } from '@angular/core';
import { MatProgressBarModule, ProgressBarMode } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';

import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserAuthService } from '../../services/auth/user-auth.service';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatProgressBarModule, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'] 
})
export class LoginComponent {
  private userAuth = inject(UserAuthService);
  private router = inject(Router);

  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  passwordFormControl = new FormControl('', [Validators.required]);
  confirmPasswordFormControl = new FormControl('', [Validators.required]);
  matcher = new MyErrorStateMatcher();

  progress: ProgressBarMode = 'determinate';
  isSigningIn: boolean = true;

  async login() {
    this.progress = 'indeterminate';
    const email = this.emailFormControl.value ?? '';
    const password = this.passwordFormControl.value ?? '';
  
    if (this.emailFormControl.valid && this.passwordFormControl.valid) {
      try {
        const loginResponse = await this.userAuth.loginUser(email, password);
        console.log("Logged In User: ", loginResponse.uid);
        this.progress = 'determinate';
        this.router.navigate(['/']);
      } catch (error: any) {
        alert(error);
        console.log(error);
        this.progress = 'determinate';
      }
    }
  }
  
  async signUp() {
    this.progress = 'indeterminate';

    const email = this.emailFormControl.value ?? '';
    const password = this.passwordFormControl.value ?? '';
  
    if (this.emailFormControl.valid && this.passwordFormControl.valid) {
      try {
        const signUpResponse = await this.userAuth.registerUser(email, password);
        console.log("Registered User: ", signUpResponse.uid);
        this.progress = 'determinate';
        this.router.navigate(['/']);
      } catch (error: any) {
        alert(error);
        console.log(error);
        this.progress = 'determinate';
      }
    }
  }

  toggleSignInUp() {
    this.isSigningIn = !this.isSigningIn;
  }

  passwordsMatch(): boolean {
    return this.passwordFormControl.value === this.confirmPasswordFormControl.value;
  }
}
