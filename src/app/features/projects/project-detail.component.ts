import { Component, ViewChild, TemplateRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../core/services/project.service';
import { Project } from '../../core/models/project.model';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ActivityLogService } from '../../core/services/activity-log.service';
import { ConfettiService } from '../../core/services/confetti.service';

type TabType = 'tasks' | 'approvals' | 'timeline' | 'history';

@Component({ selector:'app-project-detail', templateUrl:'./project-detail.component.html' })
export class ProjectDetailComponent implements OnInit {
  project?: Project;
  activeTab: TabType = 'tasks';
  @ViewChild('notFound', { static: true }) notFound?: TemplateRef<any>;

  constructor(
    private route: ActivatedRoute,
    private projects: ProjectService,
    public auth: AuthService,
    private toast: ToastService,
    private activityLog: ActivityLogService,
    private confetti: ConfettiService
  ){
    const id = this.route.snapshot.paramMap.get('id')!;
    this.project = this.projects.byId(id);
  }

  ngOnInit() {
    // Subscribe to project changes
    this.projects.projects$.subscribe(() => {
      if (this.project) {
        this.project = this.projects.byId(this.project.id);
      }
    });
  }

  setTab(tab: TabType) {
    this.activeTab = tab;
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  onCahierSelected(ev: Event){
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if(!file || !this.project) return;

    const hadCahier = !!this.project.cahier;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      await this.projects.setCahier(this.project!.id, { fileName: file.name, mimeType: file.type, size: file.size, base64 });
      this.project = this.projects.byId(this.project!.id);
      this.activityLog.log(this.project!.id, hadCahier ? 'cps_replaced' : 'cps_uploaded', file.name);
      this.toast.show('Cahier des charges ajouté', 'success');
    };
    reader.readAsDataURL(file);
  }

  downloadCahier(){
    if(!this.project?.cahier) return;
    const c = this.project.cahier;
    const link = document.createElement('a');
    link.href = `data:${c.mimeType};base64,${c.base64}`;
    link.download = c.fileName;
    link.click();
  }

  canValidate(): boolean {
    if (!this.project) return false;
    return this.projects.areAllTasksValidatedForProject(this.project.id);
  }

  async toggleChefValidation(){
    if(!this.project) return;

    if (!this.canValidate() && !this.project.validatedByChef) {
      this.toast.show('Toutes les tâches doivent être validées', 'error');
      return;
    }

    const newStatus = !this.project.validatedByChef;
    await this.projects.update(this.project.id, { validatedByChef: newStatus });
    this.activityLog.log(this.project.id, newStatus ? 'project_validated' : 'project_invalidated');
    this.project = this.projects.byId(this.project.id);

    if (newStatus) {
      // 🎉 Celebrate project validation with confetti!
      this.confetti.fire();
      this.toast.show('🎉 Projet validé avec succès!', 'success');
    } else {
      this.toast.show('Validation retirée', 'info');
    }
  }
}

