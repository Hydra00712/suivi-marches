import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface Shortcut {
  keys: string[];
  description: string;
  action?: () => void;
}

@Component({
  selector: 'app-keyboard-shortcuts',
  template: `
    <div class="shortcuts-overlay" *ngIf="show" (click)="close()">
      <div class="shortcuts-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>⌨️ Raccourcis Clavier</h2>
          <button class="close-btn" (click)="close()">✕</button>
        </div>
        
        <div class="shortcuts-grid">
          <div class="shortcut-section">
            <h3>🧭 Navigation</h3>
            <div class="shortcut-item" *ngFor="let s of navigationShortcuts">
              <div class="keys">
                <kbd *ngFor="let k of s.keys">{{ k }}</kbd>
              </div>
              <span class="desc">{{ s.description }}</span>
            </div>
          </div>
          
          <div class="shortcut-section">
            <h3>⚡ Actions</h3>
            <div class="shortcut-item" *ngFor="let s of actionShortcuts">
              <div class="keys">
                <kbd *ngFor="let k of s.keys">{{ k }}</kbd>
              </div>
              <span class="desc">{{ s.description }}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <span class="hint">Appuyez sur <kbd>?</kbd> pour afficher/masquer</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./keyboard-shortcuts.component.scss']
})
export class KeyboardShortcutsComponent implements OnInit {
  show = false;

  navigationShortcuts: Shortcut[] = [
    { keys: ['G', 'D'], description: 'Aller au Dashboard' },
    { keys: ['G', 'P'], description: 'Aller aux Projets' },
    { keys: ['G', 'N'], description: 'Aller aux Notifications' },
    { keys: ['G', 'S'], description: 'Aller aux Paramètres' }
  ];

  actionShortcuts: Shortcut[] = [
    { keys: ['Ctrl', 'K'], description: 'Recherche globale' },
    { keys: ['Ctrl', 'N'], description: 'Nouveau projet' },
    { keys: ['Esc'], description: 'Fermer modal/menu' },
    { keys: ['?'], description: 'Aide raccourcis' }
  ];

  private lastKey = '';
  private lastKeyTime = 0;

  constructor(private router: Router, private auth: AuthService) {}

  ngOnInit() {}

  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {
    // Ignore if typing in input
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement).tagName)) {
      return;
    }

    const now = Date.now();
    const key = event.key.toUpperCase();

    // ? for help
    if (event.key === '?') {
      this.show = !this.show;
      return;
    }

    // Escape to close
    if (event.key === 'Escape') {
      this.show = false;
      return;
    }

    // G + key combos (within 500ms)
    if (this.lastKey === 'G' && now - this.lastKeyTime < 500) {
      const base = this.auth.isChef() ? '/chef' : '';
      switch (key) {
        case 'D': this.router.navigate([base + '/dashboard']); break;
        case 'P': this.router.navigate([base + '/projects']); break;
        case 'N': this.router.navigate([base + '/notifications']); break;
        case 'S': this.router.navigate(['/settings']); break;
      }
    }

    this.lastKey = key;
    this.lastKeyTime = now;
  }

  close() {
    this.show = false;
  }
}

