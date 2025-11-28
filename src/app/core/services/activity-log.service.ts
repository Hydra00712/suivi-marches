import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ActivityLog, ActivityAction } from '../models/activity-log.model';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ActivityLogService {
  private key = 'activity_logs';
  private _logs$ = new BehaviorSubject<ActivityLog[]>(this.storage.getItem<ActivityLog[]>(this.key, []));
  logs$ = this._logs$.asObservable();

  constructor(private storage: StorageService, private auth: AuthService) {}

  private save() {
    this.storage.setItem(this.key, this._logs$.value);
  }

  list(): ActivityLog[] {
    return this._logs$.value;
  }

  byProject(projectId: string): ActivityLog[] {
    return this._logs$.value
      .filter(l => l.projectId === projectId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  log(projectId: string, action: ActivityAction, details?: string) {
    const actor = this.auth.currentUser();
    if (!actor) return;

    const entry: ActivityLog = {
      id: 'log-' + Math.random().toString(36).slice(2, 9),
      projectId,
      actorId: actor.id,
      actorName: actor.name,
      action,
      details,
      timestamp: new Date().toISOString()
    };

    this._logs$.next([entry, ...this._logs$.value]);
    this.save();
  }

  getActionLabel(action: ActivityAction): string {
    const labels: Record<ActivityAction, string> = {
      project_created: 'Projet créé',
      project_updated: 'Projet modifié',
      project_validated: 'Projet validé par le chef',
      project_invalidated: 'Validation du projet retirée',
      task_created: 'Tâche créée',
      task_updated: 'Tâche mise à jour',
      task_validated: 'Tâche validée',
      task_marked_not_pertinent: 'Tâche marquée non pertinente',
      task_deleted: 'Tâche supprimée',
      comment_added: 'Commentaire ajouté',
      cps_uploaded: 'Cahier des charges ajouté',
      cps_replaced: 'Cahier des charges remplacé'
    };
    return labels[action] || action;
  }

  getActionIcon(action: ActivityAction): string {
    const icons: Record<ActivityAction, string> = {
      project_created: '📋',
      project_updated: '✏️',
      project_validated: '✅',
      project_invalidated: '❌',
      task_created: '➕',
      task_updated: '🔄',
      task_validated: '✅',
      task_marked_not_pertinent: '🚫',
      task_deleted: '🗑️',
      comment_added: '💬',
      cps_uploaded: '📄',
      cps_replaced: '📄'
    };
    return icons[action] || '📝';
  }
}

