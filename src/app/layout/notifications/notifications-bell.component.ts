import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-notifications-bell',
  templateUrl: './notifications-bell.component.html',
  styleUrls: ['./notifications-bell.component.scss']
})
export class NotificationsBellComponent {
  constructor(public notifs: NotificationService, public auth: AuthService, private router: Router) {}
  open(){
    const role = this.auth.currentRole();
    this.router.navigate([role === 'chef' ? '/chef/notifications' : '/notifications']);
  }
}

