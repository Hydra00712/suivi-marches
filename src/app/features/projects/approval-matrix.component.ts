import { Component, Input, OnInit } from '@angular/core';
import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { Task } from '../../core/models/task.model';
import { Employee } from '../../core/models/employee.model';

interface MatrixCell {
  taskId: string;
  employeeId: string;
  status: 'validated' | 'not_pertinent' | 'pending';
}

@Component({
  selector: 'app-approval-matrix',
  templateUrl: './approval-matrix.component.html'
})
export class ApprovalMatrixComponent implements OnInit {
  @Input() projectId!: string;

  tasks: Task[] = [];
  employees: Employee[] = [];
  matrix: Map<string, MatrixCell> = new Map();

  constructor(private taskService: TaskService, private authService: AuthService) {}

  ngOnInit() {
    this.refresh();
    this.taskService.tasks$.subscribe(() => this.refresh());
  }

  refresh() {
    this.tasks = this.taskService.byProject(this.projectId);
    // Get employees that are relevant to this project (those who validated/marked any task)
    const allUsers = this.authService.listUsers().filter(u => u.role === 'employe');
    const involvedIds = new Set<string>();

    this.tasks.forEach(t => {
      t.validatedBy.forEach(id => involvedIds.add(id));
      t.notPertinentBy.forEach(id => involvedIds.add(id));
    });

    // Include all employees if none involved yet
    this.employees = involvedIds.size > 0
      ? allUsers.filter(u => involvedIds.has(u.id))
      : allUsers;

    // Build matrix
    this.matrix.clear();
    this.tasks.forEach(t => {
      this.employees.forEach(e => {
        const key = `${t.id}-${e.id}`;
        let status: MatrixCell['status'] = 'pending';
        if (t.validatedBy.includes(e.id)) status = 'validated';
        else if (t.notPertinentBy.includes(e.id)) status = 'not_pertinent';
        this.matrix.set(key, { taskId: t.id, employeeId: e.id, status });
      });
    });
  }

  getCell(taskId: string, employeeId: string): MatrixCell | undefined {
    return this.matrix.get(`${taskId}-${employeeId}`);
  }

  getStatusIcon(status: MatrixCell['status']): string {
    switch (status) {
      case 'validated': return '✅';
      case 'not_pertinent': return '🚫';
      default: return '⏳';
    }
  }

  getStatusClass(status: MatrixCell['status']): string {
    switch (status) {
      case 'validated': return 'status-validated';
      case 'not_pertinent': return 'status-not-pertinent';
      default: return 'status-pending';
    }
  }

  get validatedTasksCount(): number {
    return this.tasks.filter(t => t.validatedBy.length > 0).length;
  }

  get totalTasks(): number {
    return this.tasks.length;
  }

  get progressPercent(): number {
    if (this.totalTasks === 0) return 0;
    return Math.round((this.validatedTasksCount / this.totalTasks) * 100);
  }

  isTaskValidated(task: Task): boolean {
    return task.validatedBy.length > 0;
  }
}

