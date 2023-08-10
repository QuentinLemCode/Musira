import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'musira-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  constructor(
    @Inject(ActivatedRoute) private route: ActivatedRoute,
    @Inject(UserService) private user: UserService,
    @Inject(Router) private router: Router,
  ) {}

  error = '';

  form = new FormGroup({
    username: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
  });

  get email() {
    return this.form.value.email;
  }

  get password() {
    return this.form.value.password;
  }

  get username() {
    return this.form.value.username;
  }

  submit() {
    if (!this.email || !this.password || !this.username) {
      return;
    }
    this.user
      .emailRegister(this.email, this.username, this.password)
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error) => {
          if (error?.error?.cause === 'ip') {
            this.error =
              'Vous avez déjà enregistré un compte sur cet appareil. Veuillez revenir à la page précédente et vous connecter avec votre compte.';
          }
        },
      });
  }
}
