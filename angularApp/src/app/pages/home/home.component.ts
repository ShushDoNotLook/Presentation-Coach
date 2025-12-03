import { Component } from '@angular/core';
import { UserAuthService } from '../../services/auth/user-auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  userEmail = "";

  constructor(private auth: UserAuthService) {
    this.auth.userEmail().then((email)=> {
      this.userEmail = email as string;
    })
    .catch((err) => {
      // Handle Error Of user Not Logged in
    })
  }
}