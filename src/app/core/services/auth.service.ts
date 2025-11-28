import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Employee, Role } from '../models/employee.model';
import { StorageService } from './storage.service';
import { OrgService } from '../models/service.model';

export interface LoginResult {
  success: boolean;
  error?: 'invalid_credentials' | 'account_disabled' | 'user_not_found';
  user?: Employee;
}

export interface RegisterResult {
  success: boolean;
  error?: 'email_exists' | 'invalid_data';
  user?: Employee;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private usersKey = 'users';
  private servicesKey = 'services';
  private currentUserKey = 'currentUser';
  private loginAttemptsKey = 'login_attempts';
  private _currentUser$ = new BehaviorSubject<Employee | null>(null);
  currentUser$ = this._currentUser$.asObservable();

  constructor(private storage: StorageService){
    const services = this.storage.getItem<OrgService[]>(this.servicesKey, []);
    if (services.length === 0) {
      this.storage.setItem(this.servicesKey, [
        { id: 'srv-1', name: 'Informatique' },
        { id: 'srv-2', name: 'Ressources Humaines' },
        { id: 'srv-3', name: 'Finance' },
        { id: 'srv-4', name: 'Commercial' }
      ]);
    }
    const saved = this.storage.getItem<Employee | null>(this.currentUserKey, null);
    if (saved) this._currentUser$.next(saved);
  }

  // Simple hash function for demo (in production, use bcrypt on backend)
  private hashPassword(password: string): string {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'hash_' + Math.abs(hash).toString(16);
  }

  private verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  listUsers(): Employee[] { return this.storage.getItem<Employee[]>(this.usersKey, []); }
  listEmployees(): Employee[] { return this.listUsers().filter(u => u.role === 'employe' && u.isActive); }
  listChefs(): Employee[] { return this.listUsers().filter(u => u.role === 'chef' && u.isActive); }
  listServices(): OrgService[] { return this.storage.getItem<OrgService[]>(this.servicesKey, []); }

  getUserById(id: string): Employee | undefined {
    return this.listUsers().find(u => u.id === id);
  }

  getUserByEmail(email: string): Employee | undefined {
    return this.listUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  login(email: string, password: string): LoginResult {
    const user = this.getUserByEmail(email);

    if (!user) {
      return { success: false, error: 'user_not_found' };
    }

    if (!user.isActive) {
      return { success: false, error: 'account_disabled' };
    }

    if (!this.verifyPassword(password, user.passwordHash)) {
      this.recordFailedAttempt(email);
      return { success: false, error: 'invalid_credentials' };
    }

    // Update last login
    const users = this.listUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx].lastLoginAt = new Date().toISOString();
      this.storage.setItem(this.usersKey, users);
    }

    this._currentUser$.next(user);
    this.storage.setItem(this.currentUserKey, user);
    this.clearFailedAttempts(email);

    return { success: true, user };
  }

  register(data: { name: string; email: string; password: string; role: Role; serviceId: string }): RegisterResult {
    if (this.getUserByEmail(data.email)) {
      return { success: false, error: 'email_exists' };
    }

    if (!data.name || !data.email || !data.password || data.password.length < 6) {
      return { success: false, error: 'invalid_data' };
    }

    const user: Employee = {
      id: 'u-' + Math.random().toString(36).slice(2, 11),
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: this.hashPassword(data.password),
      role: data.role,
      serviceId: data.serviceId,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    const users = this.listUsers();
    users.push(user);
    this.storage.setItem(this.usersKey, users);

    return { success: true, user };
  }

  logout() {
    this._currentUser$.next(null);
    localStorage.removeItem(this.currentUserKey);
  }

  // Failed login attempt tracking
  private recordFailedAttempt(email: string) {
    const attempts = this.storage.getItem<Record<string, { count: number; lastAttempt: string }>>(this.loginAttemptsKey, {});
    const now = new Date().toISOString();
    attempts[email] = {
      count: (attempts[email]?.count || 0) + 1,
      lastAttempt: now
    };
    this.storage.setItem(this.loginAttemptsKey, attempts);
  }

  private clearFailedAttempts(email: string) {
    const attempts = this.storage.getItem<Record<string, { count: number; lastAttempt: string }>>(this.loginAttemptsKey, {});
    delete attempts[email];
    this.storage.setItem(this.loginAttemptsKey, attempts);
  }

  getFailedAttempts(email: string): number {
    const attempts = this.storage.getItem<Record<string, { count: number; lastAttempt: string }>>(this.loginAttemptsKey, {});
    return attempts[email]?.count || 0;
  }

  isAccountLocked(email: string): boolean {
    return this.getFailedAttempts(email) >= 5;
  }

  // Password reset (demo - just resets to a default)
  resetPassword(email: string, newPassword: string): boolean {
    const users = this.listUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (idx < 0) return false;

    users[idx].passwordHash = this.hashPassword(newPassword);
    this.storage.setItem(this.usersKey, users);
    this.clearFailedAttempts(email);
    return true;
  }

  currentUser(): Employee | null { return this._currentUser$.value; }
  currentRole(): Role | 'invité' { return this._currentUser$.value?.role ?? 'invité'; }
  isEmployee(): boolean { return this._currentUser$.value?.role === 'employe'; }
  isChef(): boolean { return this._currentUser$.value?.role === 'chef'; }
  isLoggedIn(): boolean { return this._currentUser$.value !== null; }
}

