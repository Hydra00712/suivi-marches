import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { AppNotification } from '../models/notification.model';
import { StorageService } from './storage.service';
import { TaskService } from './task.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private key = 'notifications';
  private _notifs$ = new BehaviorSubject<AppNotification[]>(this.storage.getItem<AppNotification[]>(this.key, []));
  notifs$ = this._notifs$.asObservable();

  unreadCount$ = combineLatest([this.notifs$, this.auth.currentUser$]).pipe(
    map(([all, user]) => all.filter(n => n.userId === (user?.id || '') && !n.read).length)
  );

  constructor(private storage: StorageService, private tasks: TaskService, private auth: AuthService){
    this.tasks.tasks$.subscribe(()=> this.generateDeadlineNotifications());
  }

  private save(){ this.storage.setItem(this.key, this._notifs$.value); }
  list(): AppNotification[]{ return this._notifs$.value; }
  forUser(userId: string): AppNotification[]{ return this._notifs$.value.filter(n => n.userId === userId).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)); }

  add(n: Omit<AppNotification, 'id'|'createdAt'|'read'>){ const item: AppNotification = { id: 'n-' + Math.random().toString(36).slice(2,9), createdAt: new Date().toISOString(), read:false, ...n }; this._notifs$.next([item, ...this._notifs$.value]); this.save(); }
  markAsRead(id: string){ this._notifs$.next(this._notifs$.value.map(n => n.id===id?{...n, read:true}:n)); this.save(); }
  markAllAsRead(userId: string){ this._notifs$.next(this._notifs$.value.map(n => n.userId===userId?{...n, read:true}:n)); this.save(); }
  clearAllForUser(userId: string){ this._notifs$.next(this._notifs$.value.filter(n => n.userId!==userId)); this.save(); }

  private generateDeadlineNotifications(){
    const now = Date.now();
    const soon = 15 * 24 * 60 * 60 * 1000;
    const tasks = this.tasks.list();
    tasks.forEach(t => {
      const d = new Date(t.finalDate).getTime();
      if (d - now <= soon && d - now > 0){
        const users = this.auth.listUsers();
        users.forEach(u => {
          const exists = this._notifs$.value.find(n => n.userId===u.id && n.relatedTaskId===t.id && n.type==='deadline');
          if (!exists){ this.add({ userId: u.id, type:'deadline', title:'Échéance proche', message:`La tâche "${t.title}" approche.`, relatedTaskId: t.id, relatedProjectId: t.projectId }); }
        });
      }
    });
  }
}

