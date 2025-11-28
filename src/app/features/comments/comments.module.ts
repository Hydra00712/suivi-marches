import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { CommentListComponent } from './comment-list.component';

@NgModule({
  declarations: [CommentListComponent],
  imports: [CommonModule, FormsModule, SharedModule],
  exports: [CommentListComponent]
})
export class CommentsModule {}

