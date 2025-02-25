import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ComponentsModule } from '../components/components.module';
import { CallbackComponent } from './callback/callback.component';
import { DeleteAccountComponent } from './delete-account/delete-account.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    LoginComponent,
    CallbackComponent,
    DeleteAccountComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ComponentsModule,
    FontAwesomeModule,
  ],
})
export class AuthenticationModule {}
