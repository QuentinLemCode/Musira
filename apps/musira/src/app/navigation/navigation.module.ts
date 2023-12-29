import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from './navigation.component';
import { AuthenticationModule } from '../authentication/authentication.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SessionsModule } from '../sessions/sessions.module';
import { AppRoutingModule } from '../app-routing.module';

@NgModule({
  declarations: [NavigationComponent],
  imports: [
    CommonModule,
    AuthenticationModule,
    FontAwesomeModule,
    SessionsModule,
    AppRoutingModule,
  ],
  exports: [NavigationComponent],
})
export class NavigationModule {}
