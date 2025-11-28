import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { EmployeeNotificationsComponent } from './employee-notifications.component';

@NgModule({
  declarations: [EmployeeNotificationsComponent],
  imports: [CommonModule, FormsModule, SharedModule],
  exports: [EmployeeNotificationsComponent]
})
export class EmployeeModule {}

