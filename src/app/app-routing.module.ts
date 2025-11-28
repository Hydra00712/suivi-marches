import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { EmployeeGuard } from './core/guards/employee.guard';
import { ChefGuard } from './core/guards/chef.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ProjectListComponent } from './features/projects/project-list.component';
import { ProjectFormComponent } from './features/projects/project-form.component';
import { ProjectDetailComponent } from './features/projects/project-detail.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ChefProjectsComponent } from './features/chef/chef-projects.component';
import { ChefNotificationsComponent } from './features/chef/chef-notifications.component';
import { EmployeeNotificationsComponent } from './features/employee/employee-notifications.component';
import { EmployeeStatsComponent } from './features/chef/employee-stats.component';
import { NotificationPreferencesComponent } from './features/settings/notification-preferences.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Employee routes
  { path: 'projects', canActivate: [AuthGuard, EmployeeGuard], component: ProjectListComponent },
  { path: 'projects/new', canActivate: [AuthGuard], component: ProjectFormComponent },
  { path: 'projects/:id', canActivate: [AuthGuard, EmployeeGuard], component: ProjectDetailComponent },
  { path: 'notifications', canActivate: [AuthGuard, EmployeeGuard], component: EmployeeNotificationsComponent },
  { path: 'settings', canActivate: [AuthGuard], component: NotificationPreferencesComponent },

  // Chef routes
  { path: 'chef/dashboard', canActivate: [AuthGuard, ChefGuard], component: DashboardComponent },
  { path: 'chef/projects', canActivate: [AuthGuard, ChefGuard], component: ChefProjectsComponent },
  { path: 'chef/projects/:id', canActivate: [AuthGuard, ChefGuard], component: ProjectDetailComponent },
  { path: 'chef/notifications', canActivate: [AuthGuard, ChefGuard], component: ChefNotificationsComponent },
  { path: 'chef/stats/employes', canActivate: [AuthGuard, ChefGuard], component: EmployeeStatsComponent },
  { path: 'chef/settings', canActivate: [AuthGuard, ChefGuard], component: NotificationPreferencesComponent },

  { path: '**', redirectTo: 'login' }
];

@NgModule({ imports: [RouterModule.forRoot(routes)], exports: [RouterModule] })
export class AppRoutingModule {}

