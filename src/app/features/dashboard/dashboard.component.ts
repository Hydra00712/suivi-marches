import { Component, OnInit, OnDestroy } from '@angular/core';
import { StatsService } from '../../core/services/stats.service';
import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { ProjectService } from '../../core/services/project.service';
import { interval, Subscription } from 'rxjs';

interface TrendPoint {
  label: string;
  value: number;
  height: number;
}

interface BudgetByService {
  serviceId: string;
  serviceName: string;
  budget: number;
  percent: number;
  projectCount: number;
}

@Component({ selector:'app-dashboard', templateUrl:'./dashboard.component.html', styleUrls:['./dashboard.component.scss'] })
export class DashboardComponent implements OnInit, OnDestroy {
  trendData: TrendPoint[] = [];
  pieSegments: { color: string; percent: number; offset: number; label: string; value: number }[] = [];
  topProjects: { name: string; progress: number; budget: number; status: string }[] = [];
  budgetByService: BudgetByService[] = [];

  private refreshSub?: Subscription;

  constructor(
    public stats: StatsService,
    public tasks: TaskService,
    private auth: AuthService,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    this.refreshAllCharts();
    // Auto-refresh every 30 seconds for real-time updates
    this.refreshSub = interval(30000).subscribe(() => this.refreshAllCharts());
  }

  ngOnDestroy() {
    this.refreshSub?.unsubscribe();
  }

  refreshAllCharts() {
    this.calculateTrend();
    this.calculatePieChart();
    this.calculateTopProjects();
    this.calculateBudgetByService();
  }

  get totalTasks(): number {
    return this.tasks.list().length;
  }

  get totalProjects(): number {
    return this.projectService.list().length;
  }

  get completionRate(): number {
    const total = this.totalTasks;
    if (total === 0) return 0;
    const completed = this.stats.kpis().byState.validee;
    return Math.round((completed / total) * 100);
  }

  get validatedProjects(): number {
    return this.projectService.list().filter(p => p.validatedByChef).length;
  }

  get maxState(): number {
    const s = this.stats.kpis().byState;
    return Math.max(s.en_attente, s.en_cours, s.validee, s.non_validee, 1);
  }

  get maxBudget(): number {
    const arr = this.stats.budgetPerService();
    return Math.max(1, ...arr.map(a => a.budget));
  }

  getPercent(value: number): number {
    return (value / this.maxState) * 100;
  }

  getBudgetPercent(value: number): number {
    return (value / this.maxBudget) * 100;
  }

  getDonutGradient(): string {
    const s = this.stats.kpis().byState;
    const total = s.en_attente + s.en_cours + s.validee + s.non_validee || 1;
    const p1 = (s.en_attente / total) * 100;
    const p2 = p1 + (s.en_cours / total) * 100;
    const p3 = p2 + (s.validee / total) * 100;
    return `conic-gradient(#f59e0b 0% ${p1}%, #3b82f6 ${p1}% ${p2}%, #22c55e ${p2}% ${p3}%, #ef4444 ${p3}% 100%)`;
  }

  getServiceName(serviceId: string): string {
    const services = this.auth.listServices();
    const svc = services.find(s => s.id === serviceId);
    return svc?.name || serviceId;
  }

  getBarColor(index: number): string {
    const colors = ['pink', 'blue', 'teal', 'purple'];
    return colors[index % colors.length];
  }

  // FULLY DYNAMIC: Monthly project creation trend from actual data
  private calculateTrend() {
    const now = new Date();
    const projects = this.projectService.list();
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    const data: { label: string; value: number }[] = [];

    // Last 6 months based on actual project creation dates
    for (let i = 5; i >= 0; i--) {
      const targetMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthIndex = targetMonth.getMonth();
      const year = targetMonth.getFullYear();

      // Count projects created in this month from actual database
      const count = projects.filter(p => {
        const created = new Date(p.createdAt);
        return created.getMonth() === monthIndex && created.getFullYear() === year;
      }).length;

      data.push({
        label: monthNames[monthIndex],
        value: count  // Real count from database, no random fallback
      });
    }

    const max = Math.max(...data.map(d => d.value), 1);
    this.trendData = data.map(d => ({
      ...d,
      height: (d.value / max) * 100
    }));
  }

  // FULLY DYNAMIC: Task state distribution from actual data
  private calculatePieChart() {
    const allTasks = this.tasks.list();

    // Count tasks by state from actual database
    const stateCount = {
      en_attente: allTasks.filter(t => t.state === 'en_attente').length,
      en_cours: allTasks.filter(t => t.state === 'en_cours').length,
      validee: allTasks.filter(t => t.state === 'validee').length,
      non_validee: allTasks.filter(t => t.state === 'non_validee').length
    };

    const total = allTasks.length || 1;

    const segments = [
      { label: 'En attente', value: stateCount.en_attente, color: '#f59e0b' },
      { label: 'En cours', value: stateCount.en_cours, color: '#3b82f6' },
      { label: 'Validée', value: stateCount.validee, color: '#22c55e' },
      { label: 'Non validée', value: stateCount.non_validee, color: '#ef4444' }
    ];

    let offset = 0;
    this.pieSegments = segments.map(seg => {
      const percent = (seg.value / total) * 100;
      const result = { ...seg, percent, offset };
      offset += percent;
      return result;
    });
  }

  // FULLY DYNAMIC: Top projects sorted by progress from actual data
  private calculateTopProjects() {
    const projects = this.projectService.list();
    const allTasks = this.tasks.list();

    // Calculate progress for each project from actual task data
    const projectsWithProgress = projects.map(p => {
      const projectTasks = allTasks.filter(t => t.projectId === p.id);
      const completed = projectTasks.filter(t => t.state === 'validee').length;
      const total = projectTasks.length || 1;
      const progress = Math.round((completed / total) * 100);

      return {
        name: p.title.length > 30 ? p.title.substring(0, 30) + '...' : p.title,
        progress,
        budget: p.budget,
        status: p.validatedByChef ? 'validated' : 'pending',
        taskCount: projectTasks.length
      };
    });

    // Sort by progress (highest first) and take top 5
    this.topProjects = projectsWithProgress
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5);
  }

  // FULLY DYNAMIC: Budget by service from actual data
  private calculateBudgetByService() {
    const projects = this.projectService.list();
    const services = this.auth.listServices();

    // Group projects by service and sum budgets
    const serviceMap = new Map<string, { budget: number; count: number }>();

    projects.forEach(p => {
      const current = serviceMap.get(p.serviceId) || { budget: 0, count: 0 };
      serviceMap.set(p.serviceId, {
        budget: current.budget + p.budget,
        count: current.count + 1
      });
    });

    // Convert to array and calculate percentages
    const maxBudget = Math.max(...Array.from(serviceMap.values()).map(v => v.budget), 1);

    this.budgetByService = Array.from(serviceMap.entries()).map(([serviceId, data]) => {
      const service = services.find(s => s.id === serviceId);
      return {
        serviceId,
        serviceName: service?.name || serviceId,
        budget: data.budget,
        percent: (data.budget / maxBudget) * 100,
        projectCount: data.count
      };
    }).sort((a, b) => b.budget - a.budget);
  }

  formatBudget(value: number): string {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M €';
    if (value >= 1000) return (value / 1000).toFixed(0) + 'K €';
    return value + ' €';
  }
}

