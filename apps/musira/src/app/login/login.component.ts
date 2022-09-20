import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  form = new FormGroup({
    name: new FormControl(''),
  });
  error = '';

  get name() {
    return this.form.value.name;
  }

  @ViewChild('input')
  inputLogin!: ElementRef<HTMLInputElement>;

  constructor(private user: UserService, private router: Router) {}
  ngOnInit(): void {
    setTimeout(() => {
      this.inputLogin.nativeElement.focus();
    }, 0);
  }

  login() {
    if (!this.name) {
      this.error = 'Veuillez entrer votre nom.';
      return;
    }
    this.user.login(this.name).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          return this.navigateTo('register');
        }
        if (error.status === 403) {
          if (error.error?.cause === 'locked') {
            this.error =
              "Votre compte est verrouillé. Veuillez contacter l'hôte.";
          } else if (error.error?.cause === 'password') {
            return this.navigateTo('password');
          } else if (error.error?.cause === 'challenge') {
            return this.navigateTo('challenge');
          }
        }
        return;
      },
    });
  }

  private navigateTo(destination: 'register' | 'password' | 'challenge') {
    return this.router.navigate(['login', destination], {
      queryParams: { name: this.name },
    });
  }
}
