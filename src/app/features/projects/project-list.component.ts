import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';
import { Project } from '../../core/models/project.model';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({ selector:'app-project-list', templateUrl:'./project-list.component.html' })
export class ProjectListComponent {
  query = '';

  constructor(
    public projects: ProjectService,
    public auth: AuthService,
    private router: Router,
    private toast: ToastService
  ){}

  filtered(): Project[]{
    const me = this.auth.currentUser();
    if(!me) return [];
    const list = this.projects.byOwner(me.id);
    const q = this.query.toLowerCase();
    return !q ? list : list.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }

  open(p: Project){
    this.router.navigate(['/projects', p.id]);
  }

  async remove(p: Project){
    if(confirm('Supprimer ce projet ?')) {
      try {
        await this.projects.remove(p.id);
        this.toast.show('Projet supprimé', 'success');
      } catch (error) {
        this.toast.show('Erreur lors de la suppression', 'error');
      }
    }
  }
}

