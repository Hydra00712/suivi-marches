import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task, TaskState } from '../models/task.model';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private key = 'tasks';
  private _tasks$ = new BehaviorSubject<Task[]>(this.storage.getItem<Task[]>(this.key, []));
  tasks$ = this._tasks$.asObservable();

  constructor(private storage: StorageService) {}

  private save(){ this.storage.setItem(this.key, this._tasks$.value); }
  all(): Task[]{ return this._tasks$.value; }
  list(): Task[]{ return this._tasks$.value; }
  byId(id: string): Task | undefined { return this._tasks$.value.find(t => t.id === id); }
  byProject(projectId: string): Task[]{ return this._tasks$.value.filter(t => t.projectId === projectId); }

  create(data: Partial<Task>): Task {
    const t: Task = {
      id: 't-' + Math.random().toString(36).slice(2,9),
      projectId: data.projectId!,
      title: data.title || 'Nouvelle tâche',
      description: data.description || '',
      finalDate: data.finalDate || new Date().toISOString(),
      durationDays: data.durationDays || 0,
      state: (data.state as TaskState) || 'en_attente',
      validatedBy: [],
      notPertinentBy: []
    };
    this._tasks$.next([t, ...this._tasks$.value]); this.save(); return t;
  }

  update(id: string, patch: Partial<Task>){ this._tasks$.next(this._tasks$.value.map(t => t.id===id?{...t, ...patch}:t)); this.save(); }
  remove(id: string){ this._tasks$.next(this._tasks$.value.filter(t => t.id !== id)); this.save(); }
  removeByProject(projectId: string){ this._tasks$.next(this._tasks$.value.filter(t => t.projectId !== projectId)); this.save(); }

  setState(id: string, state: TaskState){ this.update(id, { state }); }

  validateBy(id: string, employeeId: string){
    const t = this.byId(id);
    if (!t) return;
    const validatedBy = [...t.validatedBy];
    if (!validatedBy.includes(employeeId)) {
      validatedBy.push(employeeId);
    }
    this.update(id, { validatedBy, state: 'validee' });
  }

  markNotPertinent(id: string, employeeId: string){
    const t = this.byId(id);
    if (!t) return;
    const set = new Set(t.notPertinentBy);
    set.add(employeeId);
    this.update(id, { notPertinentBy: Array.from(set) });
  }

  isTaskValidatedByAnyEmployee(taskId: string): boolean {
    const t = this.byId(taskId); return !!t && t.validatedBy.length > 0;
  }
}

