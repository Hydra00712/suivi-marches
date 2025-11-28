import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ProjectListComponent } from './project-list.component';
import { ProjectFormComponent } from './project-form.component';
import { ProjectDetailComponent } from './project-detail.component';
import { ApprovalMatrixComponent } from './approval-matrix.component';
import { TaskTimelineComponent } from './task-timeline.component';
import { ActivityHistoryComponent } from './activity-history.component';
import { CpsPreviewComponent } from './cps-preview.component';
import { TasksModule } from '../tasks/tasks.module';
import { CommentsModule } from '../comments/comments.module';

@NgModule({
  declarations: [
    ProjectListComponent,
    ProjectFormComponent,
    ProjectDetailComponent,
    ApprovalMatrixComponent,
    TaskTimelineComponent,
    ActivityHistoryComponent,
    CpsPreviewComponent
  ],
  imports: [CommonModule, FormsModule, RouterModule, SharedModule, TasksModule, CommentsModule],
  exports: [
    ProjectListComponent,
    ProjectFormComponent,
    ProjectDetailComponent,
    ApprovalMatrixComponent,
    TaskTimelineComponent,
    ActivityHistoryComponent,
    CpsPreviewComponent
  ]
})
export class ProjectsModule {}

