import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Project } from '../models/project.model';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';
import { TaskService } from './task.service';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private key = 'projects';
  private _projects$ = new BehaviorSubject<Project[]>(this.storage.getItem<Project[]>(this.key, []));
  projects$ = this._projects$.asObservable();

  constructor(private storage: StorageService, private auth: AuthService, private tasks: TaskService) {}

  private save(){ this.storage.setItem(this.key, this._projects$.value); }
  all(): Project[]{ return this._projects$.value; }
  list(): Project[]{ return this._projects$.value; }
  byId(id: string): Project | undefined { return this._projects$.value.find(p => p.id === id); }
  byOwner(userId: string): Project[]{ return this._projects$.value.filter(p => p.ownerId === userId); }
  byService(serviceId: string): Project[]{ return this._projects$.value.filter(p => p.serviceId === serviceId); }

  create(data: Partial<Project>): Project {
    const now = new Date().toISOString();
    const p: Project = {
      id: 'p-' + Math.random().toString(36).slice(2,9),
      title: data.title || 'Sans titre',
      description: data.description || '',
      serviceId: data.serviceId || this.auth.currentUser()?.serviceId || 'srv-1',
      ownerId: (data.ownerId as string) || this.auth.currentUser()?.id || 'unknown',
      budget: data.budget || 0,
      durationDays: data.durationDays || 0,
      deadline: data.deadline || now,
      cahier: data.cahier || null,
      validatedByChef: false,
      createdAt: now
    };
    this._projects$.next([p, ...this._projects$.value]); this.save(); return p;
  }

  update(id: string, patch: Partial<Project>){ this._projects$.next(this._projects$.value.map(p => p.id===id?{...p, ...patch}:p)); this.save(); }
  remove(id: string){ this._projects$.next(this._projects$.value.filter(p => p.id!==id)); this.save(); this.tasks.removeByProject(id); }
  setCahier(id: string, cahier: NonNullable<Project['cahier']>){ this.update(id, { cahier }); }

  areAllTasksValidatedForProject(projectId: string): boolean {
    const t = this.tasks.byProject(projectId);
    if (t.length === 0) return false;
    return t.every(task => this.tasks.isTaskValidatedByAnyEmployee(task.id));
  }
}

