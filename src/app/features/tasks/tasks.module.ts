import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { TaskListComponent } from './task-list.component';
import { TaskFormComponent } from './task-form.component';

@NgModule({
  declarations: [TaskListComponent, TaskFormComponent],
  imports: [CommonModule, FormsModule, SharedModule],
  exports: [TaskListComponent, TaskFormComponent]
})
export class TasksModule {}

