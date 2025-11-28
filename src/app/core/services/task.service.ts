import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Task, TaskState } from '../models/task.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private _tasks$ = new BehaviorSubject<Task[]>([]);
  tasks$ = this._tasks$.asObservable();

  constructor(private api: ApiService) {
    this.loadTasks();
  }

  loadTasks() {
    this.api.getTasks().subscribe({
      next: (tasks) => this._tasks$.next(tasks),
      error: (err) => console.error('Failed to load tasks:', err)
    });
  }

  loadTasksByProject(projectId: string) {
    this.api.getTasks(projectId).subscribe({
      next: (tasks) => {
        // Merge with existing tasks, replacing those with same projectId
        const otherTasks = this._tasks$.value.filter(t => t.projectId !== projectId);
        this._tasks$.next([...tasks, ...otherTasks]);
      },
      error: (err) => console.error('Failed to load tasks:', err)
    });
  }

  all(): Task[] { return this._tasks$.value; }
  list(): Task[] { return this._tasks$.value; }
  byId(id: string): Task | undefined { return this._tasks$.value.find(t => t.id === id); }
  byProject(projectId: string): Task[] { return this._tasks$.value.filter(t => t.projectId === projectId); }

  async create(data: Partial<Task>): Promise<Task> {
    const taskData = {
      projectId: data.projectId!,
      title: data.title || 'Nouvelle tâche',
      description: data.description || '',
      finalDate: data.finalDate || new Date().toISOString(),
      durationDays: data.durationDays || 0,
      state: data.state || 'en_attente'
    };

    const task = await firstValueFrom(this.api.createTask(taskData));
    this._tasks$.next([task, ...this._tasks$.value]);
    return task;
  }

  async update(id: string, patch: Partial<Task>): Promise<void> {
    const current = this.byId(id);
    if (!current) return;

    const updated = await firstValueFrom(this.api.updateTask(id, { ...current, ...patch }));
    this._tasks$.next(this._tasks$.value.map(t => t.id === id ? updated : t));
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.api.deleteTask(id));
    this._tasks$.next(this._tasks$.value.filter(t => t.id !== id));
  }

  removeByProject(projectId: string) {
    // Tasks are deleted via CASCADE when project is deleted
    this._tasks$.next(this._tasks$.value.filter(t => t.projectId !== projectId));
  }

  async setState(id: string, state: TaskState): Promise<void> {
    await this.update(id, { state });
  }

  async validateBy(id: string, employeeId: string): Promise<void> {
    const updated = await firstValueFrom(this.api.validateTask(id, employeeId));
    this._tasks$.next(this._tasks$.value.map(t => t.id === id ? updated : t));
  }

  async markNotPertinent(id: string, employeeId: string): Promise<void> {
    const updated = await firstValueFrom(this.api.markTaskNotPertinent(id, employeeId));
    this._tasks$.next(this._tasks$.value.map(t => t.id === id ? updated : t));
  }

  isTaskValidatedByAnyEmployee(taskId: string): boolean {
    const t = this.byId(taskId);
    return !!t && t.validatedBy.length > 0;
  }
}

