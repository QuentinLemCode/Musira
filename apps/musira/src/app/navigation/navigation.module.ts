import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from './navigation.component';
import { UserModule } from '../user/user.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SessionsModule } from '../sessions/sessions.module';
import { AppRoutingModule } from '../app-routing.module';

@NgModule({
  declarations: [NavigationComponent],
  imports: [
    CommonModule,
    UserModule,
    FontAwesomeModule,
    SessionsModule,
    AppRoutingModule,
  ],
  exports: [NavigationComponent],
})
export class NavigationModule {}
