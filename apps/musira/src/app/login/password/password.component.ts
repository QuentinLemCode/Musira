import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss'],
})
export class PasswordComponent implements OnInit {
  form = new FormGroup({
    password: new FormControl(''),
  });

  @ViewChild('input')
  inputPassword!: ElementRef<HTMLInputElement>;

  error = '';

  get password() {
    return this.form.value.password;
  }
  constructor(
    private route: ActivatedRoute,
    private user: UserService,
    private router: Router
  ) {}
  name = '';
  ngOnInit(): void {
    this.name = this.route.snapshot.queryParams['name'];
    setTimeout(() => {
      this.inputPassword.nativeElement.focus();
    }, 0);
  }

  submit() {
    if (!this.password) return;
    this.user.loginWithPassword(this.name, this.password).subscribe({
      next: () => {
        return this.router.navigate(['/']);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 403 && error.error.cause === 'password') {
          this.error = 'Mauvais mot de passe';
        }
      },
    });
  }
}
