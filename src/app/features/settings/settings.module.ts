import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NotificationPreferencesComponent } from './notification-preferences.component';

@NgModule({
  declarations: [NotificationPreferencesComponent],
  imports: [CommonModule, FormsModule, RouterModule],
  exports: [NotificationPreferencesComponent]
})
export class SettingsModule {}

