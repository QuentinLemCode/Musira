import type { OnInit } from '@angular/core';
import { Component, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';

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
  name = '';
  error = '';
  ngOnInit(): void {
    this.name = this.route.snapshot.queryParams['name'];
  }

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
