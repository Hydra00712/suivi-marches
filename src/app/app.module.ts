import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HeaderComponent } from './layout/header/header.component';
import { NotificationsBellComponent } from './layout/notifications/notifications-bell.component';

import { AuthGuard } from './core/guards/auth.guard';
import { EmployeeGuard } from './core/guards/employee.guard';
import { ChefGuard } from './core/guards/chef.guard';

import { AuthModule } from './features/auth/auth.module';
import { ProjectsModule } from './features/projects/projects.module';
import { TasksModule } from './features/tasks/tasks.module';
import { CommentsModule } from './features/comments/comments.module';
import { DashboardModule } from './features/dashboard/dashboard.module';
import { ChefModule } from './features/chef/chef.module';
import { EmployeeModule } from './features/employee/employee.module';
import { SettingsModule } from './features/settings/settings.module';
import { SharedModule } from './shared/shared.module';
import { SeedService } from './core/services/seed.service';

export function seedFactory(seed: SeedService){
  return () => seed.seed();
}

@NgModule({
  declarations: [AppComponent, HeaderComponent, NotificationsBellComponent],
  imports: [BrowserModule, FormsModule, HttpClientModule, RouterModule, SharedModule, AuthModule, ProjectsModule, TasksModule, CommentsModule, DashboardModule, ChefModule, EmployeeModule, SettingsModule, AppRoutingModule],
  providers: [AuthGuard, EmployeeGuard, ChefGuard, { provide: APP_INITIALIZER, useFactory: seedFactory, deps: [SeedService], multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule {}

