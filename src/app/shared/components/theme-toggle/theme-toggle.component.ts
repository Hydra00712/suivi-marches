import { Component } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  template: `
    <button class="theme-toggle" (click)="toggle()" [title]="isDark ? 'Mode clair' : 'Mode sombre'">
      <div class="toggle-track" [class.light]="!isDark">
        <div class="toggle-thumb">
          <span class="icon">{{ isDark ? '🌙' : '☀️' }}</span>
        </div>
        <div class="stars" *ngIf="isDark">
          <span class="star" *ngFor="let s of [1,2,3]"></span>
        </div>
        <div class="clouds" *ngIf="!isDark">
          <span class="cloud" *ngFor="let c of [1,2]"></span>
        </div>
      </div>
    </button>
  `,
  styles: [`
    .theme-toggle {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
    }
    .toggle-track {
      width: 60px;
      height: 30px;
      background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
      border-radius: 15px;
      position: relative;
      transition: all 0.4s ease;
      overflow: hidden;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
    }
    .toggle-track.light {
      background: linear-gradient(135deg, #87CEEB 0%, #60a5fa 100%);
    }
    .toggle-thumb {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 24px;
      height: 24px;
      background: #fef3c7;
      border-radius: 50%;
      transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .toggle-track.light .toggle-thumb {
      left: 33px;
      background: #fbbf24;
    }
    .icon { font-size: 14px; }
    .stars {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    .star {
      position: absolute;
      width: 3px;
      height: 3px;
      background: #fff;
      border-radius: 50%;
      animation: twinkle 1.5s infinite;
    }
    .star:nth-child(1) { top: 8px; left: 40px; }
    .star:nth-child(2) { top: 18px; left: 48px; animation-delay: 0.3s; }
    .star:nth-child(3) { top: 12px; left: 52px; animation-delay: 0.6s; }
    .clouds {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    .cloud {
      position: absolute;
      width: 12px;
      height: 6px;
      background: rgba(255,255,255,0.8);
      border-radius: 6px;
      animation: float 3s infinite ease-in-out;
    }
    .cloud:nth-child(1) { top: 8px; left: 8px; }
    .cloud:nth-child(2) { top: 18px; left: 16px; animation-delay: 0.5s; width: 8px; }
    @keyframes twinkle { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
  `]
})
export class ThemeToggleComponent {
  constructor(private themeService: ThemeService) {}

  get isDark(): boolean {
    return this.themeService.current === 'dark';
  }

  toggle() {
    this.themeService.toggle();
  }
}

