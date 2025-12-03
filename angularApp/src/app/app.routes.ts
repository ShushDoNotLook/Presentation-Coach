import { Routes } from '@angular/router';
import { userAuthGuard } from './guards/user-auth.guard';
import { pageDeactivateGuard } from './guards/page-deactivate.guard';
import { PresentComponent } from './pages/present/present.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NewPresentationComponent } from './components/new-presentation/new-presentation.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { FeedbackComponent } from './pages/feedback/feedback.component';
import { HomeComponent } from './pages/home/home.component';
import { QuickPresentComponent } from './components/quick-present/quick-present.component';
import { presentResolver } from './guards/present.resolver';
import { feedbackResolver } from './guards/feedback.resolver';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [userAuthGuard],
    children: [
      // {
      //   path: '',
      //   component: HomeComponent
      // },
      {
        path: '',
        component: NewPresentationComponent
      },
      {
        path: 'quick-present',
        component: QuickPresentComponent,
      },
      {
        path: 'feedback/:presentationId', 
        // MAYBE :: FEEDBACK FOR ALL SESSIONS
        component: FeedbackComponent,
        canActivate: [feedbackResolver]
      },
      {
        path: 'feedback/:presentationId/session/:sessionId', 
        component: FeedbackComponent, 
        resolve: { feedback: feedbackResolver } 
      },
      {
        path: 'present/:id',
        component: PresentComponent,
        canActivate: [presentResolver],
        // canDeactivate: [pageDeactivateGuard]
      },
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  }

];
