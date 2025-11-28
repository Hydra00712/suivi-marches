import { Component, OnInit } from '@angular/core';
import { UserPreferencesService } from '../../core/services/user-preferences.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { UserNotificationPreferences } from '../../core/models/user-preferences.model';

@Component({
  selector: 'app-notification-preferences',
  templateUrl: './notification-preferences.component.html'
})
export class NotificationPreferencesComponent implements OnInit {
  preferences!: UserNotificationPreferences;

  constructor(
    private prefsService: UserPreferencesService,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.preferences = this.prefsService.getForUser(user.id);
    }
  }

  toggleDeadlineAlerts() {
    this.preferences.receiveDeadlineAlerts = !this.preferences.receiveDeadlineAlerts;
    this.save();
  }

  toggleNonPertinentAlerts() {
    this.preferences.receiveNonPertinentAlerts = !this.preferences.receiveNonPertinentAlerts;
    this.save();
  }

  toggleGroupByProject() {
    this.preferences.groupNotificationsByProject = !this.preferences.groupNotificationsByProject;
    this.save();
  }

  private save() {
    this.prefsService.update(this.preferences.userId, {
      receiveDeadlineAlerts: this.preferences.receiveDeadlineAlerts,
      receiveNonPertinentAlerts: this.preferences.receiveNonPertinentAlerts,
      groupNotificationsByProject: this.preferences.groupNotificationsByProject
    });
    this.toast.show('Préférences enregistrées', 'success');
  }
}

