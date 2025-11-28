import { Component, OnInit, OnDestroy } from '@angular/core';
import { ConfettiService } from '../../../core/services/confetti.service';
import { Subscription } from 'rxjs';

interface Confetto {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
}

@Component({
  selector: 'app-confetti',
  template: `
    <div class="confetti-container" *ngIf="show">
      <div class="confetto" *ngFor="let c of confetti"
           [style.left.%]="c.x"
           [style.background]="c.color"
           [style.animationDelay.s]="c.delay"
           [style.animationDuration.s]="c.duration"
           [style.width.px]="c.size"
           [style.height.px]="c.size * 0.4"
           [style.transform]="'rotate(' + c.rotation + 'deg)'">
      </div>
    </div>
  `,
  styles: [`
    .confetti-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 99998;
      overflow: hidden;
    }
    .confetto {
      position: absolute;
      top: -20px;
      border-radius: 2px;
      animation: confetti-fall linear forwards;
    }
    @keyframes confetti-fall {
      0% { top: -5%; opacity: 1; transform: translateX(0) rotateZ(0deg); }
      25% { transform: translateX(50px) rotateZ(90deg); }
      50% { transform: translateX(-30px) rotateZ(180deg); }
      75% { transform: translateX(40px) rotateZ(270deg); }
      100% { top: 105%; opacity: 0; transform: translateX(-20px) rotateZ(360deg); }
    }
  `]
})
export class ConfettiComponent implements OnInit, OnDestroy {
  show = false;
  confetti: Confetto[] = [];
  private sub?: Subscription;

  private colors = [
    '#7c3aed', '#a855f7', '#22c55e', '#eab308', 
    '#ef4444', '#3b82f6', '#ec4899', '#f97316'
  ];

  constructor(private confettiService: ConfettiService) {}

  ngOnInit() {
    this.sub = this.confettiService.trigger$.subscribe(() => this.fire());
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  fire() {
    this.confetti = Array.from({ length: 150 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      size: 8 + Math.random() * 8,
      rotation: Math.random() * 360
    }));
    this.show = true;
    setTimeout(() => {
      this.show = false;
      this.confetti = [];
    }, 4000);
  }
}

