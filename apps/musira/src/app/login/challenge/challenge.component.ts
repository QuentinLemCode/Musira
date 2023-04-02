import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'musira-challenge',
  templateUrl: './challenge.component.html',
  styleUrls: ['./challenge.component.scss'],
})
export class ChallengeComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private user: UserService,
    private router: Router
  ) {}
  name = '';
  error = '';
  ngOnInit(): void {
    this.name = this.route.snapshot.queryParams['name'];
  }

  submit(challenge: string) {
    this.user.loginWithChallenge(this.name, challenge).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        if (error?.error?.cause === 'challenge') {
          this.error =
            "Ce n'est pas la bonne année de naissance ou le bon émoji";
        } else if (error?.error?.cause === 'locked') {
          this.error =
            "Votre compte est verrouillé. Veuillez contacter l'hôte.";
        }
      },
    });
  }
}
