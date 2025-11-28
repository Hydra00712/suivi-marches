import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ChefProjectsComponent } from './chef-projects.component';
import { ChefNotificationsComponent } from './chef-notifications.component';
import { EmployeeStatsComponent } from './employee-stats.component';

@NgModule({
  declarations: [ChefProjectsComponent, ChefNotificationsComponent, EmployeeStatsComponent],
  imports: [CommonModule, FormsModule, RouterModule, SharedModule],
  exports: [ChefProjectsComponent, ChefNotificationsComponent, EmployeeStatsComponent]
})
export class ChefModule {}

