import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private user: UserService,
    private router: Router
  ) {}
  name = '';
  ngOnInit(): void {
    this.name = this.route.snapshot.queryParams['name'];
  }
  error = '';

  submit(challenge: string) {
    this.user.register(this.name, challenge).subscribe({
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
