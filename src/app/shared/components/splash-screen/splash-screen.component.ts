import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-splash-screen',
  template: `
    <div class="splash-screen" [class.hide]="hide" [class.slide-out]="slideOut">
      <div class="splash-content">
        <!-- Animated Logo -->
        <div class="logo-container">
          <div class="logo-circle pulse">
            <span class="logo-icon">📊</span>
          </div>
          <div class="logo-rings">
            <div class="ring ring-1"></div>
            <div class="ring ring-2"></div>
            <div class="ring ring-3"></div>
          </div>
        </div>

        <!-- App Name with typing effect -->
        <h1 class="app-title">
          <span class="title-text">Suivi Marchés</span>
          <span class="cursor">|</span>
        </h1>
        <p class="app-subtitle">Système de Gestion des Projets</p>

        <!-- Loading Progress -->
        <div class="loading-container">
          <div class="loading-bar">
            <div class="loading-progress" [style.width.%]="progress"></div>
          </div>
          <div class="loading-text">{{ loadingText }}</div>
        </div>

        <!-- Features Preview -->
        <div class="features-preview">
          <div class="feature-item" *ngFor="let f of features; let i = index" 
               [class.visible]="currentFeature >= i">
            <span class="feature-icon">{{ f.icon }}</span>
            <span class="feature-text">{{ f.text }}</span>
          </div>
        </div>
      </div>

      <!-- Background Particles -->
      <div class="particles">
        <div class="particle" *ngFor="let p of particles" 
             [style.left.%]="p.x" [style.animationDelay.s]="p.delay"></div>
      </div>
    </div>
  `,
  styleUrls: ['./splash-screen.component.scss']
})
export class SplashScreenComponent implements OnInit {
  @Output() complete = new EventEmitter<void>();

  progress = 0;
  loadingText = 'Initialisation...';
  hide = false;
  slideOut = false;
  currentFeature = -1;

  features = [
    { icon: '✅', text: 'Gestion des projets' },
    { icon: '📋', text: 'Suivi des tâches' },
    { icon: '📊', text: 'Tableaux de bord' },
    { icon: '🔔', text: 'Notifications' }
  ];

  particles = Array.from({ length: 20 }, (_, i) => ({
    x: Math.random() * 100,
    delay: Math.random() * 3
  }));

  loadingSteps = [
    { progress: 20, text: 'Chargement des modules...' },
    { progress: 40, text: 'Connexion à la base de données...' },
    { progress: 60, text: 'Préparation de l\'interface...' },
    { progress: 80, text: 'Chargement des données...' },
    { progress: 100, text: 'Prêt !' }
  ];

  ngOnInit() {
    this.animateLoading();
  }

  animateLoading() {
    let step = 0;
    const featureInterval = setInterval(() => {
      if (this.currentFeature < this.features.length - 1) {
        this.currentFeature++;
      }
    }, 400);

    const interval = setInterval(() => {
      if (step < this.loadingSteps.length) {
        this.progress = this.loadingSteps[step].progress;
        this.loadingText = this.loadingSteps[step].text;
        step++;
      } else {
        clearInterval(interval);
        clearInterval(featureInterval);
        setTimeout(() => {
          this.slideOut = true;
          setTimeout(() => {
            this.hide = true;
            this.complete.emit();
          }, 600);
        }, 300);
      }
    }, 500);
  }
}

