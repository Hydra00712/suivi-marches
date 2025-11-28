import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Project } from '../models/project.model';
import { AuthService } from './auth.service';
import { TaskService } from './task.service';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private _projects$ = new BehaviorSubject<Project[]>([]);
  projects$ = this._projects$.asObservable();

  constructor(private api: ApiService, private auth: AuthService, private tasks: TaskService) {
    this.loadProjects();
  }

  loadProjects() {
    this.api.getProjects().subscribe({
      next: (projects) => this._projects$.next(projects),
      error: (err) => console.error('Failed to load projects:', err)
    });
  }

  all(): Project[] { return this._projects$.value; }
  list(): Project[] { return this._projects$.value; }
  byId(id: string): Project | undefined { return this._projects$.value.find(p => p.id === id); }
  byOwner(userId: string): Project[] { return this._projects$.value.filter(p => p.ownerId === userId); }
  byService(serviceId: string): Project[] { return this._projects$.value.filter(p => p.serviceId === serviceId); }

  async create(data: Partial<Project>): Promise<Project> {
    const projectData = {
      title: data.title || 'Sans titre',
      description: data.description || '',
      serviceId: data.serviceId || this.auth.currentUser()?.serviceId || 'srv-1',
      ownerId: data.ownerId || this.auth.currentUser()?.id || 'unknown',
      budget: data.budget || 0,
      durationDays: data.durationDays || 0,
      deadline: data.deadline || new Date().toISOString(),
      cahier: data.cahier || null
    };

    const project = await firstValueFrom(this.api.createProject(projectData));
    this._projects$.next([project, ...this._projects$.value]);
    return project;
  }

  async update(id: string, patch: Partial<Project>): Promise<void> {
    const current = this.byId(id);
    if (!current) return;

    const updated = await firstValueFrom(this.api.updateProject(id, { ...current, ...patch }));
    this._projects$.next(this._projects$.value.map(p => p.id === id ? updated : p));
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.api.deleteProject(id));
    this._projects$.next(this._projects$.value.filter(p => p.id !== id));
  }

  async setCahier(id: string, cahier: NonNullable<Project['cahier']>): Promise<void> {
    await this.update(id, { cahier });
  }

  async validateProject(id: string): Promise<void> {
    const updated = await firstValueFrom(this.api.validateProject(id));
    this._projects$.next(this._projects$.value.map(p => p.id === id ? { ...p, validatedByChef: true } : p));
  }

  areAllTasksValidatedForProject(projectId: string): boolean {
    const t = this.tasks.byProject(projectId);
    if (t.length === 0) return false;
    return t.every(task => this.tasks.isTaskValidatedByAnyEmployee(task.id));
  }
}

