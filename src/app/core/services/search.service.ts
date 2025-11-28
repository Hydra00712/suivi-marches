import { Injectable } from '@angular/core';
import { ProjectService } from './project.service';
import { TaskService } from './task.service';
import { AuthService } from './auth.service';

export interface SearchResult {
  type: 'project' | 'task' | 'employee';
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  route: string[];
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  constructor(
    private projectService: ProjectService,
    private taskService: TaskService,
    private authService: AuthService
  ) {}

  search(query: string, isChef: boolean): SearchResult[] {
    if (!query || query.trim().length < 2) return [];
    
    const q = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Search projects
    const projects = this.projectService.list();
    projects.forEach(p => {
      if (p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)) {
        results.push({
          type: 'project',
          id: p.id,
          title: p.title,
          subtitle: `Budget: ${this.formatBudget(p.budget)} • ${p.durationDays} jours`,
          icon: '📁',
          route: isChef ? ['/chef/projects', p.id] : ['/projects', p.id]
        });
      }
    });

    // Search tasks
    const tasks = this.taskService.list();
    tasks.forEach(t => {
      if (t.title.toLowerCase().includes(q)) {
        const project = projects.find(p => p.id === t.projectId);
        results.push({
          type: 'task',
          id: t.id,
          title: t.title,
          subtitle: `Projet: ${project?.title || 'N/A'} • ${this.getStatusLabel(t.state)}`,
          icon: '✅',
          route: isChef ? ['/chef/projects', t.projectId] : ['/projects', t.projectId]
        });
      }
    });

    // Search employees (Chef only)
    if (isChef) {
      const employees = this.authService.listUsers();
      employees.forEach(e => {
        if (e.name.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q)) {
          results.push({
            type: 'employee',
            id: e.id,
            title: e.name,
            subtitle: `${e.email || ''} • ${e.role === 'chef' ? 'Chef' : 'Employé'}`,
            icon: e.role === 'chef' ? '👔' : '👤',
            route: ['/chef/stats/employes']
          });
        }
      });
    }

    // Limit results
    return results.slice(0, 10);
  }

  private formatBudget(budget: number): string {
    if (budget >= 1000000) return (budget / 1000000).toFixed(1) + 'M €';
    if (budget >= 1000) return (budget / 1000).toFixed(0) + 'K €';
    return budget + ' €';
  }

  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'en_attente': '⏳ En attente',
      'en_cours': '🔄 En cours',
      'validee': '✅ Validée',
      'non_validee': '❌ Non validée'
    };
    return labels[status] || status;
  }
}

