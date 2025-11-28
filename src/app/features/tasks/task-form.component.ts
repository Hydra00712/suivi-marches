import { Component, Input } from '@angular/core';
import { TaskService } from '../../core/services/task.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ActivityLogService } from '../../core/services/activity-log.service';

@Component({ selector:'app-task-form', templateUrl:'./task-form.component.html' })
export class TaskFormComponent {
  @Input() projectId!: string;
  title = '';
  description = '';
  durationDays = 1;
  finalDate = new Date().toISOString().substring(0,10);

  constructor(
    private tasks: TaskService,
    private toast: ToastService,
    private activityLog: ActivityLogService
  ){}

  submit(){
    if(!this.projectId || !this.title.trim()) return;

    const taskTitle = this.title.trim();
    this.tasks.create({
      projectId: this.projectId,
      title: taskTitle,
      description: this.description,
      durationDays: this.durationDays,
      finalDate: new Date(this.finalDate).toISOString()
    });

    this.activityLog.log(this.projectId, 'task_created', `Tâche "${taskTitle}"`);
    this.toast.show('Tâche ajoutée', 'success');
    this.title = '';
    this.description = '';
  }
}

