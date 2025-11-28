import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, firstValueFrom } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Employee, Role } from '../models/employee.model';
import { OrgService } from '../models/service.model';
import { ApiService } from './api.service';

export interface LoginResult {
  success: boolean;
  error?: 'invalid_credentials' | 'account_disabled' | 'user_not_found' | 'account_locked';
  user?: Employee;
}

export interface RegisterResult {
  success: boolean;
  error?: 'email_exists' | 'invalid_data';
  user?: Employee;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserKey = 'currentUser';
  private _currentUser$ = new BehaviorSubject<Employee | null>(null);
  private _employees$ = new BehaviorSubject<Employee[]>([]);
  private _services$ = new BehaviorSubject<OrgService[]>([]);

  currentUser$ = this._currentUser$.asObservable();

  constructor(private api: ApiService) {
    // Load current user from localStorage
    const saved = localStorage.getItem(this.currentUserKey);
    if (saved) {
      try {
        this._currentUser$.next(JSON.parse(saved));
      } catch {}
    }

    // Load services and employees from API
    this.loadServices();
    this.loadEmployees();
  }

  private loadServices() {
    this.api.getServices().subscribe({
      next: (services) => this._services$.next(services),
      error: () => console.warn('Could not load services from API')
    });
  }

  private loadEmployees() {
    this.api.getEmployees().subscribe({
      next: (employees) => this._employees$.next(employees),
      error: () => console.warn('Could not load employees from API')
    });
  }

  listUsers(): Employee[] { return this._employees$.value; }
  listEmployees(): Employee[] { return this._employees$.value.filter(u => u.role === 'employe'); }
  listChefs(): Employee[] { return this._employees$.value.filter(u => u.role === 'chef'); }
  listServices(): OrgService[] { return this._services$.value; }

  getUserById(id: string): Employee | undefined {
    return this._employees$.value.find(u => u.id === id);
  }

  getUserByEmail(email: string): Employee | undefined {
    return this._employees$.value.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  async loginAsync(email: string, password: string): Promise<LoginResult> {
    try {
      const user = await firstValueFrom(this.api.login(email, password));
      this._currentUser$.next(user);
      localStorage.setItem(this.currentUserKey, JSON.stringify(user));
      this.loadEmployees(); // Refresh employees list
      return { success: true, user };
    } catch (error: any) {
      const errorMsg = error?.error?.error || '';
      if (errorMsg.includes('verrouillé') || errorMsg.includes('locked')) {
        return { success: false, error: 'account_locked' };
      }
      return { success: false, error: 'invalid_credentials' };
    }
  }

  // Synchronous login for backwards compatibility
  login(email: string, password: string): LoginResult {
    // This is now async internally, but we return a pending result
    // Components should use loginAsync instead
    this.loginAsync(email, password);
    return { success: false, error: 'invalid_credentials' }; // Placeholder
  }

  async registerAsync(data: { name: string; email: string; password: string; role: Role; serviceId: string }): Promise<RegisterResult> {
    if (!data.name || !data.email || !data.password || data.password.length < 6) {
      return { success: false, error: 'invalid_data' };
    }

    try {
      const user = await firstValueFrom(this.api.register(data));
      this.loadEmployees(); // Refresh employees list
      return { success: true, user };
    } catch (error: any) {
      const errorMsg = error?.error?.error || '';
      if (errorMsg.includes('utilisé') || errorMsg.includes('exists')) {
        return { success: false, error: 'email_exists' };
      }
      return { success: false, error: 'invalid_data' };
    }
  }

  register(data: { name: string; email: string; password: string; role: Role; serviceId: string }): RegisterResult {
    // Async version should be used instead
    this.registerAsync(data);
    return { success: false, error: 'invalid_data' };
  }

  logout() {
    this._currentUser$.next(null);
    localStorage.removeItem(this.currentUserKey);
  }

  currentUser(): Employee | null { return this._currentUser$.value; }
  currentRole(): Role | 'invité' { return this._currentUser$.value?.role ?? 'invité'; }
  isEmployee(): boolean { return this._currentUser$.value?.role === 'employe'; }
  isChef(): boolean { return this._currentUser$.value?.role === 'chef'; }
  isLoggedIn(): boolean { return this._currentUser$.value !== null; }

  // Refresh data from API
  refreshData() {
    this.loadServices();
    this.loadEmployees();
  }
}

