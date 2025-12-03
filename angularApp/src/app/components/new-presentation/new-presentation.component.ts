import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroupDirective, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { NgIf } from '@angular/common';
import { ErrorStateMatcher } from '@angular/material/core';
import { Router } from '@angular/router';
import { SlidesService } from '../../services/slides/slides.service'
import { IPresentation, PresentationService } from '../../services/presentation/presentation.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
@Component({
  selector: 'app-new-presentation',
  standalone: true,
  imports: [MatProgressSpinnerModule, MatButtonModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatCardModule, NgIf, ReactiveFormsModule, MatDividerModule],
  templateUrl: './new-presentation.component.html',
  styleUrl: './new-presentation.component.css',
  providers: [
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } }
  ]
})


export class NewPresentationComponent {

  public presentationNameFormControl = new FormControl('', [Validators.required]);
  public improveFormControl = new FormControl('', [Validators.required]);
  public audienceFormControl = new FormControl('', [Validators.required]);
  matcher = new MyErrorStateMatcher();

  public previewImage = ""
  selectedFile: File | undefined = undefined;
  submitting: boolean = false;
  loading: boolean = false;

  fileErrorMessage: string | null = null;

  router = inject(Router);
  slidesService = inject(SlidesService);
  presentationService: PresentationService = inject(PresentationService)

  async onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] ?? null;
    this.loading = true;
    // DONE: Show user progress on slides conversion.
    if (this.selectedFile) {
      await this.presentationService.wipPresentation(this.selectedFile)
      await this.presentationService.loadUserPresentations()
    }

    this.loading = false
  }

  async onSubmit() {
    this.submitting = true;

    if (!this.presentationService.wipPreviewImage) {
      // DONE: HANDLE ERROR
      this.fileErrorMessage = "File is not valid or non-existent. Please upload another file.";
      this.submitting = false;
      return;
    }

    this.fileErrorMessage = null;

    let newPresentation: IPresentation = {
      name: this.presentationNameFormControl.value || "",
      improvements: this.improveFormControl.value || "",
      audience: this.audienceFormControl.value || "",
    };


    try {
      let newPresentationID = await this.presentationService.addPresentation(newPresentation);

      await this.presentationService.loadUserPresentations();
      this.submitting = false;
      this.router.navigateByUrl(`/present/${newPresentationID}`);

    } catch (error) {
      console.log(error)
      this.submitting = false;
    }
  }
}