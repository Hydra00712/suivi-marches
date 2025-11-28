import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserNotificationPreferences, getDefaultPreferences } from '../models/user-preferences.model';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class UserPreferencesService {
  private key = 'user_preferences';
  private _prefs$ = new BehaviorSubject<UserNotificationPreferences[]>(
    this.storage.getItem<UserNotificationPreferences[]>(this.key, [])
  );
  prefs$ = this._prefs$.asObservable();

  constructor(private storage: StorageService) {}

  private save() {
    this.storage.setItem(this.key, this._prefs$.value);
  }

  getForUser(userId: string): UserNotificationPreferences {
    const existing = this._prefs$.value.find(p => p.userId === userId);
    if (existing) return existing;

    // Create default preferences
    const defaults = getDefaultPreferences(userId);
    this._prefs$.next([...this._prefs$.value, defaults]);
    this.save();
    return defaults;
  }

  update(userId: string, patch: Partial<Omit<UserNotificationPreferences, 'userId'>>) {
    const prefs = this._prefs$.value;
    const idx = prefs.findIndex(p => p.userId === userId);

    if (idx >= 0) {
      prefs[idx] = { ...prefs[idx], ...patch };
    } else {
      prefs.push({ ...getDefaultPreferences(userId), ...patch });
    }

    this._prefs$.next([...prefs]);
    this.save();
  }

  shouldReceiveDeadlineAlerts(userId: string): boolean {
    return this.getForUser(userId).receiveDeadlineAlerts;
  }

  shouldReceiveNonPertinentAlerts(userId: string): boolean {
    return this.getForUser(userId).receiveNonPertinentAlerts;
  }

  shouldGroupByProject(userId: string): boolean {
    return this.getForUser(userId).groupNotificationsByProject;
  }
}

