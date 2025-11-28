import { Component, Input } from '@angular/core';
import { TaskService } from '../../core/services/task.service';
import { Task, TaskState } from '../../core/models/task.model';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ActivityLogService } from '../../core/services/activity-log.service';

@Component({ selector:'app-task-list', templateUrl:'./task-list.component.html' })
export class TaskListComponent {
  @Input() projectId!: string;

  constructor(
    public tasks: TaskService,
    public auth: AuthService,
    private toast: ToastService,
    private activityLog: ActivityLogService
  ){}

  list(): Task[]{
    return this.tasks.byProject(this.projectId);
  }

  setState(t: Task, s: TaskState){
    this.tasks.setState(t.id, s);
    this.activityLog.log(this.projectId, 'task_updated', `Tâche "${t.title}" → ${s}`);
    this.toast.show(`Tâche passée en "${s}"`, 'info');
  }

  validate(t: Task){
    const me = this.auth.currentUser();
    if(!me) return;
    this.tasks.validateBy(t.id, me.id);
    this.activityLog.log(this.projectId, 'task_validated', `Tâche "${t.title}"`);
    this.toast.show('Tâche validée', 'success');
  }

  markNotPertinent(t: Task){
    const me = this.auth.currentUser();
    if(!me) return;
    this.tasks.markNotPertinent(t.id, me.id);
    this.activityLog.log(this.projectId, 'task_marked_not_pertinent', `Tâche "${t.title}"`);
    this.toast.show('Tâche marquée non pertinente', 'info');
  }

  remove(t: Task){
    if(confirm('Supprimer cette tâche ?')) {
      this.tasks.remove(t.id);
      this.activityLog.log(this.projectId, 'task_deleted', `Tâche "${t.title}"`);
      this.toast.show('Tâche supprimée', 'success');
    }
  }
}

