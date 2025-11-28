import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';
import { CahierDeCharge } from '../../core/models/cahier.model';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ActivityLogService } from '../../core/services/activity-log.service';

@Component({ selector:'app-project-form', templateUrl:'./project-form.component.html' })
export class ProjectFormComponent {
  title = '';
  description = '';
  budget = 0;
  durationDays = 30;
  deadline = new Date(Date.now() + 30*24*60*60*1000).toISOString().substring(0,10);
  cahierFile: File | null = null;
  cahierData: CahierDeCharge | null = null;

  constructor(
    private projects: ProjectService,
    private router: Router,
    public auth: AuthService,
    private toast: ToastService,
    private activityLog: ActivityLogService
  ){}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.cahierFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      this.cahierData = {
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        base64
      };
      this.toast.show('Fichier ajouté', 'success');
    };
    reader.readAsDataURL(file);
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  async submit() {
    const owner = this.auth.currentUser();
    if (!owner || !this.title.trim()) return;

    try {
      const p = await this.projects.create({
        title: this.title.trim(),
        description: this.description,
        budget: this.budget,
        durationDays: this.durationDays,
        deadline: new Date(this.deadline).toISOString(),
        cahier: this.cahierData
      });

      this.activityLog.log(p.id, 'project_created', `Projet "${p.title}"`);
      this.toast.show('Projet créé avec succès', 'success');
      const url = this.auth.isChef() ? ['/chef/projects', p.id] : ['/projects', p.id];
      this.router.navigate(url);
    } catch (error) {
      this.toast.show('Erreur lors de la création du projet', 'error');
    }
  }
}

