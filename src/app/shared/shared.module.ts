import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { ToastComponent } from './components/toast/toast.component';
import { GlobalSearchComponent } from './components/global-search/global-search.component';
import { SplashScreenComponent } from './components/splash-screen/splash-screen.component';
import { ConfettiComponent } from './components/confetti/confetti.component';
import { KeyboardShortcutsComponent } from './components/keyboard-shortcuts/keyboard-shortcuts.component';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';

@NgModule({
  declarations: [
    SearchBarComponent,
    ToastComponent,
    GlobalSearchComponent,
    SplashScreenComponent,
    ConfettiComponent,
    KeyboardShortcutsComponent,
    ThemeToggleComponent
  ],
  imports: [CommonModule, FormsModule, RouterModule],
  exports: [
    CommonModule,
    FormsModule,
    SearchBarComponent,
    ToastComponent,
    GlobalSearchComponent,
    SplashScreenComponent,
    ConfettiComponent,
    KeyboardShortcutsComponent,
    ThemeToggleComponent
  ]
})
export class SharedModule {}

