import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { TaskService } from '../../core/services/task.service';
import { ProjectService } from '../../core/services/project.service';
import { Employee } from '../../core/models/employee.model';

interface EmployeeStat {
  employee: Employee;
  tasksValidated: number;
  tasksMarkedNotPertinent: number;
  projectsInvolved: number;
  validationRate: number;
}

@Component({
  selector: 'app-employee-stats',
  templateUrl: './employee-stats.component.html'
})
export class EmployeeStatsComponent implements OnInit {
  stats: EmployeeStat[] = [];
  totalEmployees = 0;
  totalValidations = 0;
  avgValidationRate = 0;
  mostActiveEmployee = '';

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    this.calculateStats();
  }

  calculateStats() {
    const employees = this.authService.listUsers().filter(u => u.role === 'employe');
    const allTasks = this.taskService.all();
    const allProjects = this.projectService.all();

    this.stats = employees.map(emp => {
      const tasksValidated = allTasks.filter(t => t.validatedBy.includes(emp.id)).length;
      const tasksMarkedNotPertinent = allTasks.filter(t => t.notPertinentBy.includes(emp.id)).length;

      // Count projects where employee has validated at least one task
      const projectIds = new Set<string>();
      allTasks.forEach(t => {
        if (t.validatedBy.includes(emp.id) || t.notPertinentBy.includes(emp.id)) {
          projectIds.add(t.projectId);
        }
      });

      const totalActions = tasksValidated + tasksMarkedNotPertinent;
      const validationRate = totalActions > 0 ? (tasksValidated / totalActions) * 100 : 0;

      return {
        employee: emp,
        tasksValidated,
        tasksMarkedNotPertinent,
        projectsInvolved: projectIds.size,
        validationRate
      };
    }).sort((a, b) => b.tasksValidated - a.tasksValidated);

    // Calculate totals
    this.totalEmployees = employees.length;
    this.totalValidations = this.stats.reduce((sum, s) => sum + s.tasksValidated, 0);
    this.avgValidationRate = this.stats.length > 0
      ? this.stats.reduce((sum, s) => sum + s.validationRate, 0) / this.stats.length
      : 0;
    this.mostActiveEmployee = this.stats.length > 0 ? this.stats[0].employee.name : '-';
  }

  getBarWidth(value: number): number {
    const max = Math.max(...this.stats.map(s => s.tasksValidated), 1);
    return (value / max) * 100;
  }
}

