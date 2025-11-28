import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  open = false;
  constructor(public auth: AuthService, public notifs: NotificationService, private router: Router) {}
  logout(){ this.auth.logout(); this.router.navigate(['/login']); }
}

