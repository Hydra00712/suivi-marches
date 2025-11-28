import { Injectable } from '@angular/core';
import { Employee } from '../models/employee.model';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private key = 'profiles';
  constructor(private storage: StorageService){}
  getProfile(userId: string): Partial<Employee> | null {
    const all = this.storage.getItem<Record<string, Partial<Employee>>>(this.key, {});
    return all[userId] || null;
  }
  updateProfile(userId: string, patch: Partial<Employee>){
    const all = this.storage.getItem<Record<string, Partial<Employee>>>(this.key, {});
    all[userId] = { ...(all[userId]||{}), ...patch };
    this.storage.setItem(this.key, all);
  }
}

