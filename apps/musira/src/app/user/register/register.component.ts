import type { OnInit } from '@angular/core';
import { Component, Inject } from '@angular/core';
import type {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../user.service';

@Component({
  selector: 'musira-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  constructor(
    @Inject(ActivatedRoute) private route: ActivatedRoute,
    @Inject(UserService) private user: UserService,
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
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.loading = false;
          if (error?.error?.cause === 'ip') {
            this.error =
              'Vous avez déjà enregistré un compte sur cet appareil. Veuillez revenir à la page précédente et vous connecter avec votre compte.';
          }
        },
      });
  }

  private static passwordMatchValidator(
    controlToCheck: AbstractControl,
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password: string = controlToCheck?.value;
      const confirmPassword: string = control.value;
      if (password !== confirmPassword) {
        return { PassswordMatch: true };
      } else {
        return null;
      }
    };
  }
}
