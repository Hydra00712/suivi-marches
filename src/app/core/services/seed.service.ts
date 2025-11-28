import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { ProjectService } from './project.service';
import { TaskService } from './task.service';
import { CommentService } from './comment.service';
import { AuthService } from './auth.service';
import { ActivityLogService } from './activity-log.service';
import { Employee } from '../models/employee.model';

@Injectable({ providedIn: 'root' })
export class SeedService {
  private didKey = 'seeded_v3'; // Increment to force re-seed with new auth format
  constructor(
    private storage: StorageService,
    private projects: ProjectService,
    private tasks: TaskService,
    private comments: CommentService,
    private auth: AuthService,
    private activityLog: ActivityLogService
  ){}

  seed(){
    try{
      // Check if we need to migrate old users (no email field)
      const users = this.storage.getItem<Employee[]>('users', []);
      const needsMigration = users.length > 0 && users.some(u => !u.email);

      if (needsMigration) {
        console.log('Migrating old user data to new format...');
        // Clear old data and re-seed
        localStorage.removeItem('users');
        localStorage.removeItem('projects');
        localStorage.removeItem('tasks');
        localStorage.removeItem('comments');
        localStorage.removeItem('currentUser');
        localStorage.removeItem(this.didKey);
      }

      if (localStorage.getItem(this.didKey)) return;

      // Create employees and chefs
      const employees = this.createEmployees();
      const serviceId = 'srv-1';

      // Create 30 projects with tasks
      this.createProjects(employees, serviceId);

      localStorage.setItem(this.didKey, '1');
      console.log('Seed complete! Demo credentials: any email like alice.martin@entreprise.com with password: password123');
    } catch(err){ console.error('Seed failed', err); }
  }

  // Simple hash function matching AuthService
  private hashPassword(password: string): string {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'hash_' + Math.abs(hash).toString(16);
  }

  private createEmployees(): Employee[] {
    const employeeData = [
      { name: 'Alice Martin', service: 'srv-1' },
      { name: 'Thomas Bernard', service: 'srv-1' },
      { name: 'Sophie Dubois', service: 'srv-2' },
      { name: 'Lucas Moreau', service: 'srv-1' },
      { name: 'Emma Leroy', service: 'srv-3' },
      { name: 'Hugo Simon', service: 'srv-1' },
      { name: 'Léa Michel', service: 'srv-2' },
      { name: 'Nathan Laurent', service: 'srv-4' },
      { name: 'Chloé Garcia', service: 'srv-1' },
      { name: 'Théo Roux', service: 'srv-3' },
      { name: 'Camille Morel', service: 'srv-2' },
      { name: 'Maxime Fournier', service: 'srv-1' },
      { name: 'Manon Girard', service: 'srv-4' },
      { name: 'Antoine Bonnet', service: 'srv-1' },
      { name: 'Julie Dupont', service: 'srv-2' },
      { name: 'Romain Mercier', service: 'srv-3' },
      { name: 'Laura Legrand', service: 'srv-1' },
      { name: 'Julien Garnier', service: 'srv-4' },
      { name: 'Sarah Faure', service: 'srv-2' },
      { name: 'Alexandre Robin', service: 'srv-1' }
    ];

    const chefData = [
      { name: 'Bob Directeur', service: 'srv-1' },
      { name: 'Marie Chef', service: 'srv-2' },
      { name: 'Pierre Manager', service: 'srv-3' }
    ];

    const users: Employee[] = [];
    const defaultPassword = this.hashPassword('password123');
    const now = new Date().toISOString();

    employeeData.forEach((emp, i) => {
      const email = this.nameToEmail(emp.name);
      users.push({
        id: `u-emp-${i + 1}`,
        name: emp.name,
        email,
        passwordHash: defaultPassword,
        role: 'employe',
        serviceId: emp.service,
        createdAt: now,
        isActive: true
      });
    });

    chefData.forEach((chef, i) => {
      const email = this.nameToEmail(chef.name);
      users.push({
        id: `u-chef-${i + 1}`,
        name: chef.name,
        email,
        passwordHash: defaultPassword,
        role: 'chef',
        serviceId: chef.service,
        createdAt: now,
        isActive: true
      });
    });

    this.storage.setItem('users', users);
    return users.filter(u => u.role === 'employe');
  }

  private nameToEmail(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/\s+/g, '.')
      + '@entreprise.com';
  }

  private createProjects(employees: Employee[], serviceId: string) {
    const projectData = [
      { title: 'Migration SI', desc: 'Migration complète du système d\'information vers le cloud', budget: 250000, days: 180 },
      { title: 'Portail RH', desc: 'Création d\'un portail RH self-service pour les employés', budget: 85000, days: 120 },
      { title: 'Refonte Site Web', desc: 'Modernisation du site vitrine de l\'entreprise', budget: 45000, days: 60 },
      { title: 'Application Mobile', desc: 'Développement d\'une app mobile pour clients', budget: 120000, days: 150 },
      { title: 'ERP Finance', desc: 'Implémentation module finance ERP', budget: 180000, days: 200 },
      { title: 'CRM Commercial', desc: 'Mise en place CRM pour équipe commerciale', budget: 95000, days: 90 },
      { title: 'Intranet V2', desc: 'Nouvelle version de l\'intranet collaboratif', budget: 65000, days: 75 },
      { title: 'Data Warehouse', desc: 'Construction entrepôt de données analytics', budget: 200000, days: 160 },
      { title: 'Sécurité RGPD', desc: 'Mise en conformité RGPD et audit sécurité', budget: 75000, days: 90 },
      { title: 'Chatbot Support', desc: 'Bot IA pour support client niveau 1', budget: 55000, days: 80 },
      { title: 'API Partenaires', desc: 'Plateforme API pour intégrations partenaires', budget: 90000, days: 100 },
      { title: 'BI Dashboard', desc: 'Tableaux de bord décisionnels temps réel', budget: 70000, days: 85 },
      { title: 'GED Documents', desc: 'Gestion électronique des documents', budget: 60000, days: 70 },
      { title: 'Formation E-learning', desc: 'Plateforme formation en ligne interne', budget: 40000, days: 50 },
      { title: 'Facturation Auto', desc: 'Automatisation processus facturation', budget: 35000, days: 45 },
      { title: 'Stock Management', desc: 'Système gestion stocks et inventaire', budget: 80000, days: 95 },
      { title: 'Planning RH', desc: 'Outil planning et congés équipes', budget: 30000, days: 40 },
      { title: 'Newsletter System', desc: 'Système envoi newsletters clients', budget: 25000, days: 35 },
      { title: 'Signature Électronique', desc: 'Intégration signature électronique contrats', budget: 45000, days: 55 },
      { title: 'Backup Cloud', desc: 'Solution sauvegarde cloud sécurisée', budget: 50000, days: 60 },
      { title: 'VoIP Téléphonie', desc: 'Migration téléphonie vers VoIP', budget: 65000, days: 75 },
      { title: 'SSO Authentification', desc: 'Single Sign-On pour toutes applications', budget: 55000, days: 65 },
      { title: 'Monitoring Infra', desc: 'Supervision infrastructure IT 24/7', budget: 40000, days: 50 },
      { title: 'DevOps Pipeline', desc: 'CI/CD et automatisation déploiements', budget: 70000, days: 80 },
      { title: 'Marketplace Interne', desc: 'Place de marché services internes', budget: 85000, days: 100 },
      { title: 'Paie Intégration', desc: 'Intégration système paie et comptabilité', budget: 95000, days: 110 },
      { title: 'Recrutement ATS', desc: 'Système suivi candidatures RH', budget: 35000, days: 45 },
      { title: 'Visioconférence', desc: 'Plateforme visio sécurisée interne', budget: 30000, days: 40 },
      { title: 'Ticketing IT', desc: 'Système tickets support informatique', budget: 25000, days: 35 },
      { title: 'Analytics Web', desc: 'Tracking et analytics sites web groupe', budget: 20000, days: 30 }
    ];

    const taskTemplates = [
      ['Analyse besoins', 'Cahier des charges', 'Validation specs'],
      ['Design UX/UI', 'Maquettes', 'Revue design'],
      ['Développement Backend', 'Développement Frontend', 'Intégration'],
      ['Tests unitaires', 'Tests intégration', 'Recette utilisateur'],
      ['Documentation', 'Formation', 'Mise en production']
    ];

    const states = ['en_attente', 'en_cours', 'validee', 'non_validee'];
    const commentTexts = [
      'Bonne avancée sur ce point.',
      'À revoir avec l\'équipe.',
      'Validé, on peut continuer.',
      'Attention au délai.',
      'Excellent travail !',
      'Besoin de plus de détails.',
      'En attente de validation client.',
      'Point à discuter en réunion.'
    ];

    projectData.forEach((pd, pIndex) => {
      const owner = employees[pIndex % employees.length];
      const deadlineOffset = Math.floor(Math.random() * 120) + 30;

      const project = this.projects.create({
        title: pd.title,
        description: pd.desc,
        budget: pd.budget,
        durationDays: pd.days,
        deadline: new Date(Date.now() + deadlineOffset * 86400000).toISOString(),
        serviceId,
        ownerId: owner.id
      });

      // Create 3-6 tasks per project
      const numTasks = Math.floor(Math.random() * 4) + 3;
      const selectedTemplates = taskTemplates.flat().sort(() => Math.random() - 0.5).slice(0, numTasks);

      selectedTemplates.forEach((taskTitle, tIndex) => {
        const daysOffset = (tIndex + 1) * Math.floor(pd.days / (numTasks + 1));
        const state = states[Math.floor(Math.random() * states.length)] as any;

        const task = this.tasks.create({
          projectId: project.id,
          title: taskTitle,
          description: `Tâche ${taskTitle} pour ${pd.title}`,
          durationDays: Math.floor(Math.random() * 15) + 5,
          finalDate: new Date(Date.now() + daysOffset * 86400000).toISOString(),
          state
        });

        // Randomly validate some tasks by random employees
        if (state === 'validee' || Math.random() > 0.6) {
          const numValidators = Math.floor(Math.random() * 3) + 1;
          for (let v = 0; v < numValidators; v++) {
            const validator = employees[Math.floor(Math.random() * employees.length)];
            this.tasks.validateBy(task.id, validator.id);
          }
        }

        // Randomly mark some as not pertinent
        if (Math.random() > 0.8) {
          const marker = employees[Math.floor(Math.random() * employees.length)];
          this.tasks.markNotPertinent(task.id, marker.id);
        }

        // Add random comments
        if (Math.random() > 0.5) {
          const commenter = employees[Math.floor(Math.random() * employees.length)];
          const types: ('urgent' | 'quotidien' | 'informatif')[] = ['urgent', 'quotidien', 'informatif'];
          this.comments.add({
            taskId: task.id,
            userId: commenter.id,
            content: commentTexts[Math.floor(Math.random() * commentTexts.length)],
            type: types[Math.floor(Math.random() * types.length)]
          });
        }
      });
    });
  }
}

