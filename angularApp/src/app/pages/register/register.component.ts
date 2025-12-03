import { Component, inject } from '@angular/core';
import {MatProgressBarModule, ProgressBarMode} from '@angular/material/progress-bar';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { RouterModule } from '@angular/router';

import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { UserAuthService } from '../../services/auth/user-auth.service';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatProgressBarModule, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
 // Services Used By Component
  private userAuth = inject(UserAuthService);
  private router = inject(Router);

  // Form Controls and Validation Setup
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  passwordFormControl = new FormControl('', [Validators.required]);
  matcher = new MyErrorStateMatcher();

  // Component Variables
  progress = 'determinate' as ProgressBarMode

  async register() {
    // Change Progress Bar to loading
    this.progress = 'indeterminate'
    
    if (this.emailFormControl.valid && this.passwordFormControl.valid) {

      try {
        const registerResponse = await this.userAuth.registerUser(
        this.emailFormControl.value as string, 
        this.passwordFormControl.value as string
        );

        console.log("Registered User: ", registerResponse.uid)

        this.progress = 'determinate'
        this.router.navigate(['/'])

      } catch (error: any) {
        // HANDLE ERROR HERE
        alert(error)
        console.log(error)
        this.progress = 'determinate'
      }

    }


  }
}
