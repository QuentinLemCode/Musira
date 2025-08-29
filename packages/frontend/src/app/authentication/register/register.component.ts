import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, EventEmitter, Inject, Output } from '@angular/core';
import type {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'musira-register',
  template: `
    <div class="modal-register">
      <h3>Créer un compte</h3>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <input placeholder="Ton prénom" formControlName="username" />
        <input placeholder="Ton email" formControlName="email" />
        <input
          type="password"
          name="password"
          placeholder="Ton mot de passe"
          formControlName="password"
        />
        <input
          type="password"
          placeholder="Confirme ton mot de passe"
          formControlName="passwordConfirmation"
        />
        <button type="submit" [disabled]="form.invalid || loading">
          Créer un compte
        </button>
      </form>
      @if (error) {
        <p class="error">{{ error }}</p>
      }
    </div>
  `,
  styles: [
    `
      @use '../../../colors.scss' as *;
      .modal-register {
        display: grid;
        gap: 12px;
      }
      h3 {
        margin: 0;
        font-size: 22px;
      }
      form {
        display: grid;
        gap: 8px;
      }
      button {
        width: 100%;
      }
      .error {
        color: #ff6b6b;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
})
export class RegisterComponent implements OnInit {
  constructor(
    @Inject(AuthenticationService) private user: AuthenticationService,
    @Inject(Router) private router: Router,
  ) {}

  error = '';

  form = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(64),
    ]),
    passwordConfirmation: new FormControl(''),
  });

  faCircle = faCircleNotch;
  loading = false;
  @Output() success = new EventEmitter<void>();

  ngOnInit(): void {
    this.form.controls.passwordConfirmation.setValidators([
      RegisterComponent.passwordMatchValidator(this.form.controls.password),
    ]);
  }

  get formControls() {
    return this.form.controls;
  }

  get email() {
    return this.form.value.email;
  }

  get password() {
    return this.form.value.password;
  }

  get username() {
    return this.form.value.username;
  }

  get passwordConfirmation() {
    return this.form.value.passwordConfirmation;
  }

  submit() {
    if (this.form.invalid || !this.email || !this.username || !this.password) {
      return;
    }
    this.loading = true;
    this.user
      .emailRegister(this.email, this.username, this.password)
      .subscribe({
        next: () => {
          // Optimistic set to prevent guard redirect while auth status refreshes
          this.user.loggedUser.set({
            isLoggedIn: true,
            id: 0,
            userId: '0',
            username: this.username!,
            admin: false,
          });
          this.router.navigate(['/'], { replaceUrl: true });
          this.success.emit();
        },
        error: (error) => {
          this.loading = false;
          if (error?.error?.cause === 'exist') {
            this.error =
              "Cet email ou ce nom d'utilisateur est déjà pris. Veuillez choisir un autre nom ou revenir sur la page précédente pour vous connecter";
          } else {
            this.error = "Une erreur s'est produite. Veuillez réessayer.";
          }
        },
      });
  }

  private static passwordMatchValidator(
    controlToCheck: AbstractControl,
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password: string = controlToCheck.value;
      const confirmPassword: string = control.value;
      if (controlToCheck.invalid || password !== confirmPassword) {
        return { PassswordMatch: true };
      } else {
        return null;
      }
    };
  }
}
