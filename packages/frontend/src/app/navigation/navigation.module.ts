import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SessionsModule } from '../sessions/sessions.module';
import { NavigationComponent } from './navigation.component';

@NgModule({
  declarations: [NavigationComponent],
  imports: [CommonModule, FontAwesomeModule, SessionsModule, RouterLink],
  exports: [NavigationComponent],
})
export class NavigationModule {}
