import { Component, Input } from '@angular/core';
import { CommentService } from '../../core/services/comment.service';
import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { CommentType } from '../../core/models/comment.model';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ActivityLogService } from '../../core/services/activity-log.service';

@Component({ selector:'app-comment-list', templateUrl:'./comment-list.component.html' })
export class CommentListComponent {
  @Input() projectId!: string;
  selectedTaskId: string | null = null;
  content = '';
  type: CommentType = 'informatif';

  constructor(
    public comments: CommentService,
    public tasks: TaskService,
    public auth: AuthService,
    private toast: ToastService,
    private activityLog: ActivityLogService
  ){}

  taskOptions(){
    return this.tasks.byProject(this.projectId);
  }

  list(){
    return this.selectedTaskId ? this.comments.byTask(this.selectedTaskId) : [];
  }

  add(){
    const me = this.auth.currentUser();
    if(!me || !this.selectedTaskId || !this.content.trim()) return;

    const task = this.tasks.byId(this.selectedTaskId);
    this.comments.add({
      taskId: this.selectedTaskId,
      userId: me.id,
      content: this.content.trim(),
      type: this.type
    });

    this.activityLog.log(this.projectId, 'comment_added', `Sur "${task?.title || 'tâche'}"`);
    this.toast.show('Commentaire ajouté', 'success');
    this.content = '';
  }
}

