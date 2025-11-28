import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, tap } from 'rxjs';
import { Employee } from '../models/employee.model';
import { Project } from '../models/project.model';
import { Task } from '../models/task.model';
import { Comment } from '../models/comment.model';
import { AppNotification } from '../models/notification.model';
import { ActivityLog } from '../models/activity-log.model';
import { OrgService } from '../models/service.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:3002/api';

  constructor(private http: HttpClient) {}

  // ============================================
  // AUTH
  // ============================================

  login(email: string, password: string): Observable<Employee> {
    return this.http.post<Employee>(`${this.baseUrl}/auth/login`, { email, password });
  }

  register(data: { name: string; email: string; password: string; role: string; serviceId: string }): Observable<Employee> {
    return this.http.post<Employee>(`${this.baseUrl}/auth/register`, data);
  }

  // ============================================
  // SERVICES
  // ============================================

  getServices(): Observable<OrgService[]> {
    return this.http.get<OrgService[]>(`${this.baseUrl}/services`);
  }

  // ============================================
  // EMPLOYEES
  // ============================================

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.baseUrl}/employees`);
  }

  getEmployee(id: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/employees/${id}`);
  }

  getEmployeesByService(serviceId: string): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.baseUrl}/employees/service/${serviceId}`);
  }

  // ============================================
  // PROJECTS
  // ============================================

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/projects`);
  }

  getProject(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/projects/${id}`);
  }

  createProject(project: Partial<Project>): Observable<Project> {
    return this.http.post<Project>(`${this.baseUrl}/projects`, project);
  }

  updateProject(id: string, project: Partial<Project>): Observable<Project> {
    return this.http.put<Project>(`${this.baseUrl}/projects/${id}`, project);
  }

  deleteProject(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/projects/${id}`);
  }

  validateProject(id: string): Observable<Project> {
    return this.http.patch<Project>(`${this.baseUrl}/projects/${id}/validate`, {});
  }

  // ============================================
  // TASKS
  // ============================================

  getTasks(projectId?: string): Observable<Task[]> {
    const url = projectId ? `${this.baseUrl}/tasks?projectId=${projectId}` : `${this.baseUrl}/tasks`;
    return this.http.get<Task[]>(url);
  }

  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/tasks/${id}`);
  }

  createTask(task: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}/tasks`, task);
  }

  updateTask(id: string, task: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/tasks/${id}`, task);
  }

  deleteTask(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/tasks/${id}`);
  }

  validateTask(taskId: string, employeeId: string): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}/tasks/${taskId}/validate`, { employeeId });
  }

  markTaskNotPertinent(taskId: string, employeeId: string): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}/tasks/${taskId}/not-pertinent`, { employeeId });
  }

  // ============================================
  // COMMENTS
  // ============================================

  getComments(taskId?: string): Observable<Comment[]> {
    const url = taskId ? `${this.baseUrl}/comments?taskId=${taskId}` : `${this.baseUrl}/comments`;
    return this.http.get<Comment[]>(url);
  }

  createComment(comment: Partial<Comment>): Observable<Comment> {
    return this.http.post<Comment>(`${this.baseUrl}/comments`, comment);
  }

  deleteComment(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/comments/${id}`);
  }

  // ============================================
  // NOTIFICATIONS
  // ============================================

  getNotifications(userId?: string): Observable<AppNotification[]> {
    const url = userId ? `${this.baseUrl}/notifications?userId=${userId}` : `${this.baseUrl}/notifications`;
    return this.http.get<AppNotification[]>(url);
  }

  createNotification(notification: Partial<AppNotification>): Observable<AppNotification> {
    return this.http.post<AppNotification>(`${this.baseUrl}/notifications`, notification);
  }

  markNotificationRead(id: string): Observable<AppNotification> {
    return this.http.patch<AppNotification>(`${this.baseUrl}/notifications/${id}/read`, {});
  }

  markAllNotificationsRead(userId: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/notifications/read-all`, { userId });
  }

  // ============================================
  // ACTIVITY LOGS
  // ============================================

  getActivityLogs(projectId?: string): Observable<ActivityLog[]> {
    const url = projectId ? `${this.baseUrl}/activity-logs?projectId=${projectId}` : `${this.baseUrl}/activity-logs`;
    return this.http.get<ActivityLog[]>(url);
  }

  createActivityLog(log: Partial<ActivityLog>): Observable<ActivityLog> {
    return this.http.post<ActivityLog>(`${this.baseUrl}/activity-logs`, log);
  }

  // ============================================
  // STATS
  // ============================================

  getStatsOverview(): Observable<any> {
    return this.http.get(`${this.baseUrl}/stats/overview`);
  }

  getTopProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/stats/top-projects`);
  }
}

