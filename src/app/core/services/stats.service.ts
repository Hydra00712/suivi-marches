import { Injectable } from '@angular/core';
import { ProjectService } from './project.service';
import { TaskService } from './task.service';

@Injectable({ providedIn: 'root' })
export class StatsService {
  constructor(private projects: ProjectService, private tasks: TaskService){}
  kpis(){
    const ps = this.projects.list();
    const ts = this.tasks.list();
    const total = ps.length;
    const validated = ps.filter(p => p.validatedByChef).length;
    const budgets = ps.reduce((a,p)=>a+(p.budget||0),0);
    const byState = {
      en_attente: ts.filter(t=>t.state==='en_attente').length,
      en_cours: ts.filter(t=>t.state==='en_cours').length,
      validee: ts.filter(t=>t.state==='validee').length,
      non_validee: ts.filter(t=>t.state==='non_validee').length,
    };
    return { total, validated, budgets, byState };
  }
  nearDeadlines(days=15){
    const now=Date.now(); const ms=days*24*60*60*1000;
    return this.tasks.list().filter(t=>{ const d=new Date(t.finalDate).getTime(); return d-now<=ms && d-now>0; });
  }
  budgetPerProject(){ return this.projects.list().map(p=>({ title:p.title, budget:p.budget||0 })); }
  budgetPerService(){
    const acc: Record<string, number> = {};
    this.projects.list().forEach(p=>{ acc[p.serviceId]=(acc[p.serviceId]||0)+(p.budget||0); });
    return Object.entries(acc).map(([serviceId, budget])=>({ serviceId, budget }));
  }
}

