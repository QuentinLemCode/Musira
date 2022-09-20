import { Component } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  constructor(private readonly user: UserService) {}

  get isLoggedIn() {
    return this.user.isLoggedIn;
  }
}
