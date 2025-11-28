import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SearchService, SearchResult } from '../../../core/services/search.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-global-search',
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.scss']
})
export class GlobalSearchComponent {
  @ViewChild('searchInput') searchInput!: ElementRef;
  
  query = '';
  results: SearchResult[] = [];
  isOpen = false;
  selectedIndex = -1;
  isLoading = false;

  constructor(
    private searchService: SearchService,
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  onSearch() {
    if (this.query.trim().length < 2) {
      this.results = [];
      this.isOpen = false;
      return;
    }

    this.isLoading = true;
    const isChef = this.authService.isChef();
    
    // Small delay for UX
    setTimeout(() => {
      this.results = this.searchService.search(this.query, isChef);
      this.isOpen = this.results.length > 0;
      this.selectedIndex = -1;
      this.isLoading = false;
    }, 150);
  }

  onKeyDown(event: KeyboardEvent) {
    if (!this.isOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.results.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.selectedIndex >= 0) {
          this.selectResult(this.results[this.selectedIndex]);
        }
        break;
      case 'Escape':
        this.close();
        break;
    }
  }

  selectResult(result: SearchResult) {
    this.router.navigate(result.route);
    this.close();
  }

  close() {
    this.isOpen = false;
    this.query = '';
    this.results = [];
    this.selectedIndex = -1;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  // Keyboard shortcut: Ctrl+K or Cmd+K
  @HostListener('document:keydown', ['$event'])
  onGlobalKeyDown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.searchInput?.nativeElement?.focus();
    }
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'project': 'Projet',
      'task': 'Tâche',
      'employee': 'Utilisateur'
    };
    return labels[type] || type;
  }
}

