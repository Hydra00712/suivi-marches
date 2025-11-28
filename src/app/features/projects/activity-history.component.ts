import { Component, Input, OnInit } from '@angular/core';
import { ActivityLogService } from '../../core/services/activity-log.service';
import { ActivityLog } from '../../core/models/activity-log.model';

@Component({
  selector: 'app-activity-history',
  templateUrl: './activity-history.component.html'
})
export class ActivityHistoryComponent implements OnInit {
  @Input() projectId!: string;

  logs: ActivityLog[] = [];

  constructor(public activityService: ActivityLogService) {}

  ngOnInit() {
    this.refresh();
    this.activityService.logs$.subscribe(() => this.refresh());
  }

  refresh() {
    this.logs = this.activityService.byProject(this.projectId);
  }

  formatDate(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getRelativeTime(timestamp: string): string {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return this.formatDate(timestamp);
  }
}

