import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({ selector:'app-chef-notifications', templateUrl:'./chef-notifications.component.html' })
export class ChefNotificationsComponent {
  constructor(
    public auth: AuthService,
    public notifs: NotificationService,
    private toast: ToastService
  ){}

  me(){ return this.auth.currentUser(); }

  markAllRead(){
    const u = this.me();
    if(!u) return;
    this.notifs.markAllAsRead(u.id);
    this.toast.show('Toutes les notifications marquées comme lues', 'success');
  }

  clearAll(){
    const u = this.me();
    if(!u) return;
    this.notifs.clearAllForUser(u.id);
    this.toast.show('Toutes les notifications supprimées', 'success');
  }

  markRead(id: string){
    this.notifs.markAsRead(id);
    this.toast.show('Notification marquée comme lue', 'info');
  }
}

