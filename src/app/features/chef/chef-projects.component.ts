import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';
import { TaskService } from '../../core/services/task.service';
import { Project } from '../../core/models/project.model';

@Component({ selector:'app-chef-projects', templateUrl:'./chef-projects.component.html' })
export class ChefProjectsComponent {
  query = '';

  constructor(
    public projects: ProjectService,
    public auth: AuthService,
    private tasks: TaskService,
    private router: Router
  ){}

  filtered(): Project[]{
    const me = this.auth.currentUser();
    if(!me) return [];
    const list = this.projects.byService(me.serviceId);
    const q = this.query.toLowerCase();
    return !q ? list : list.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }

  getTaskCount(projectId: string): number {
    return this.tasks.byProject(projectId).length;
  }

  open(p: Project){
    this.router.navigate(['/chef/projects', p.id]);
  }
}

