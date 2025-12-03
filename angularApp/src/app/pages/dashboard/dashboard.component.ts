import { ChangeDetectorRef, Component, OnDestroy, ViewChild, computed, inject, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';
import { PresentationService } from '../../services/presentation/presentation.service';
import { KeyValuePipe, NgForOf, CommonModule, NgIf } from '@angular/common';
import { UserAuthService } from '../../services/auth/user-auth.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatSidenavModule, MatIconModule, RouterModule, MatListModule, MatButtonModule, NgForOf, NgIf, KeyValuePipe, MatExpansionModule, MatSelectModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',

})
export class DashboardComponent implements OnDestroy {

  public mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  @ViewChild('snav') sidenav!: MatSidenav;

  public isContainerVisible: {[presID: string]: boolean} = {};

  public sortedPresentations = computed(() => 
    Object.entries(this.presentationService.userPresentations()).reverse()
  );
  disablePresentationBtn = false;

  constructor(
    changeDetectorRef: ChangeDetectorRef, 
    media: MediaMatcher, 
    public router: Router, 
    public presentationService: PresentationService,
    private userAuthService: UserAuthService 
  ) {
    
    // Get boolean value, true if mobile width, false otherwise
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    // If they are on the new-presentation page, disable the new-presentation button
    this.router.events.subscribe(async (event) => {
      if (event! instanceof NavigationEnd) {
        this.disablePresentationBtn = event.url === "/"

        // When they switch pages on mobile, automatically close the sidebar for the user.
        if (this.mobileQuery.matches) {
          this.sidenav.close();
        }

      }
    })
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  logout(): void {
    this.userAuthService.logout().then(() => {
      this.router.navigate(['/login']);
    }).catch((error) => {
      console.error("Logout failed:", error);
    });
  }
}
