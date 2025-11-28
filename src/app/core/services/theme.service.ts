import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private key = 'theme';
  private _theme$ = new BehaviorSubject<Theme>(this.getStoredTheme());
  theme$ = this._theme$.asObservable();

  constructor() {
    this.applyTheme(this._theme$.value);
  }

  private getStoredTheme(): Theme {
    const stored = localStorage.getItem(this.key);
    return (stored === 'light' || stored === 'dark') ? stored : 'dark';
  }

  get current(): Theme {
    return this._theme$.value;
  }

  toggle() {
    const newTheme: Theme = this._theme$.value === 'dark' ? 'light' : 'dark';
    this._theme$.next(newTheme);
    localStorage.setItem(this.key, newTheme);
    this.applyTheme(newTheme);
  }

  setTheme(theme: Theme) {
    this._theme$.next(theme);
    localStorage.setItem(this.key, theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.remove('dark-theme', 'light-theme');
    document.body.classList.add(`${theme}-theme`);
  }
}

