import { Component, Input, OnInit } from '@angular/core';
import { TaskService } from '../../core/services/task.service';
import { Task } from '../../core/models/task.model';

interface TimelineTask extends Task {
  startDate: Date;
  endDate: Date;
  leftPercent: number;
  widthPercent: number;
  status: 'late' | 'soon' | 'normal' | 'completed';
}

@Component({
  selector: 'app-task-timeline',
  templateUrl: './task-timeline.component.html'
})
export class TaskTimelineComponent implements OnInit {
  @Input() projectId!: string;

  timelineTasks: TimelineTask[] = [];
  minDate: Date = new Date();
  maxDate: Date = new Date();
  monthLabels: { label: string; leftPercent: number }[] = [];

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.refresh();
    this.taskService.tasks$.subscribe(() => this.refresh());
  }

  refresh() {
    const tasks = this.taskService.byProject(this.projectId);
    if (tasks.length === 0) {
      this.timelineTasks = [];
      return;
    }

    const now = new Date();
    const fifteenDays = 15 * 24 * 60 * 60 * 1000;

    // Calculate date range
    const allDates: Date[] = [];
    tasks.forEach(t => {
      const end = new Date(t.finalDate);
      const start = new Date(end.getTime() - t.durationDays * 24 * 60 * 60 * 1000);
      allDates.push(start, end);
    });

    this.minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    this.maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    // Add padding
    const range = this.maxDate.getTime() - this.minDate.getTime();
    const padding = range * 0.05;
    this.minDate = new Date(this.minDate.getTime() - padding);
    this.maxDate = new Date(this.maxDate.getTime() + padding);

    const totalRange = this.maxDate.getTime() - this.minDate.getTime();

    // Map tasks to timeline
    this.timelineTasks = tasks.map(t => {
      const endDate = new Date(t.finalDate);
      const startDate = new Date(endDate.getTime() - t.durationDays * 24 * 60 * 60 * 1000);

      const leftPercent = ((startDate.getTime() - this.minDate.getTime()) / totalRange) * 100;
      const widthPercent = ((endDate.getTime() - startDate.getTime()) / totalRange) * 100;

      let status: TimelineTask['status'] = 'normal';
      if (t.state === 'validee') {
        status = 'completed';
      } else if (endDate.getTime() < now.getTime()) {
        status = 'late';
      } else if (endDate.getTime() - now.getTime() <= fifteenDays) {
        status = 'soon';
      }

      return { ...t, startDate, endDate, leftPercent, widthPercent: Math.max(widthPercent, 2), status };
    }).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    // Generate month labels
    this.generateMonthLabels(totalRange);
  }

  private generateMonthLabels(totalRange: number) {
    this.monthLabels = [];
    const current = new Date(this.minDate);
    current.setDate(1);
    current.setMonth(current.getMonth() + 1);

    while (current <= this.maxDate) {
      const leftPercent = ((current.getTime() - this.minDate.getTime()) / totalRange) * 100;
      const label = current.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      this.monthLabels.push({ label, leftPercent });
      current.setMonth(current.getMonth() + 1);
    }
  }

  getStatusClass(status: TimelineTask['status']): string {
    return `timeline-bar-${status}`;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  get todayPercent(): number {
    const now = new Date();
    const totalRange = this.maxDate.getTime() - this.minDate.getTime();
    const percent = ((now.getTime() - this.minDate.getTime()) / totalRange) * 100;
    return Math.max(0, Math.min(100, percent));
  }

  get showToday(): boolean {
    const now = new Date();
    return now >= this.minDate && now <= this.maxDate;
  }
}

