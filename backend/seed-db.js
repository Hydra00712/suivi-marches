/**
 * Seed Database Script
 * Populates the database with initial data
 * Uses sql.js (pure JavaScript SQLite)
 */

const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'suivi_marches.db');

async function seedDatabase() {
  console.log('🌱 Seeding database...\n');

  const SQL = await initSqlJs();

  // Load existing database
  let db;
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    console.log('❌ Database not found. Run init-db.js first.');
    process.exit(1);
  }

  // Hash password
  const hashPassword = (password) => bcrypt.hashSync(password, 10);
  const now = new Date().toISOString();

  // === SERVICES ===
  const services = [
    { id: 'srv-1', name: 'Informatique' },
    { id: 'srv-2', name: 'Ressources Humaines' },
    { id: 'srv-3', name: 'Finance' },
    { id: 'srv-4', name: 'Marketing' },
    { id: 'srv-5', name: 'Logistique' }
  ];

  services.forEach(s => {
    db.run('INSERT INTO services (id, name) VALUES (?, ?)', [s.id, s.name]);
  });
  console.log(`✅ Inserted ${services.length} services`);

  // === EMPLOYEES ===
  const employees = [
    // Chefs
    { id: 'chef-1', name: 'Ahmed Bennani', email: 'chef@demo.com', role: 'chef', serviceId: 'srv-1' },
    { id: 'chef-2', name: 'Fatima Alaoui', email: 'fatima.chef@demo.com', role: 'chef', serviceId: 'srv-2' },
    { id: 'chef-3', name: 'Karim Idrissi', email: 'karim.chef@demo.com', role: 'chef', serviceId: 'srv-3' },
    // Employés
    { id: 'emp-1', name: 'Mohamed Tazi', email: 'employe@demo.com', role: 'employe', serviceId: 'srv-1' },
    { id: 'emp-2', name: 'Sara Benali', email: 'sara@demo.com', role: 'employe', serviceId: 'srv-1' },
    { id: 'emp-3', name: 'Youssef Amrani', email: 'youssef@demo.com', role: 'employe', serviceId: 'srv-1' },
    { id: 'emp-4', name: 'Amal Ouazzani', email: 'amal@demo.com', role: 'employe', serviceId: 'srv-2' },
    { id: 'emp-5', name: 'Hamza Filali', email: 'hamza@demo.com', role: 'employe', serviceId: 'srv-2' },
    { id: 'emp-6', name: 'Nadia Chraibi', email: 'nadia@demo.com', role: 'employe', serviceId: 'srv-3' },
    { id: 'emp-7', name: 'Omar Benjelloun', email: 'omar@demo.com', role: 'employe', serviceId: 'srv-3' },
    { id: 'emp-8', name: 'Laila Kettani', email: 'laila@demo.com', role: 'employe', serviceId: 'srv-4' },
    { id: 'emp-9', name: 'Rachid Berrada', email: 'rachid@demo.com', role: 'employe', serviceId: 'srv-4' },
    { id: 'emp-10', name: 'Zineb Hajji', email: 'zineb@demo.com', role: 'employe', serviceId: 'srv-5' }
  ];

  const defaultPassword = hashPassword('Demo123!');
  employees.forEach(e => {
    db.run(`INSERT INTO employees (id, name, email, password_hash, role, service_id, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
           [e.id, e.name, e.email, defaultPassword, e.role, e.serviceId, now]);
  });
  console.log(`✅ Inserted ${employees.length} employees`);

  // === PROJECTS ===
  const projectTitles = [
    'Refonte du système ERP',
    'Migration Cloud Azure',
    'Application mobile RH',
    'Portail fournisseurs',
    'Système de facturation',
    'Plateforme e-learning',
    'Dashboard analytique',
    'Automatisation processus',
    'Gestion documentaire',
    'Intégration CRM'
  ];

  const projects = [];
  for (let i = 0; i < 15; i++) {
    const serviceIndex = i % 5;
    const daysAgo = Math.floor(Math.random() * 60);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
    const project = {
      id: `prj-${i + 1}`,
      title: projectTitles[i % projectTitles.length] + (i >= 10 ? ' v2' : ''),
      description: `Description détaillée du projet ${i + 1}`,
      ownerId: employees.filter(e => e.role === 'employe')[i % 10].id,
      serviceId: services[serviceIndex].id,
      budget: Math.floor(Math.random() * 200000) + 10000,
      durationDays: Math.floor(Math.random() * 180) + 30,
      deadline: new Date(Date.now() + (Math.random() * 180 + 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      validatedByChef: i < 5 ? 1 : 0,
      createdAt
    };
    projects.push(project);
    db.run(`INSERT INTO projects (id, title, description, owner_id, service_id, budget, duration_days, deadline, validated_by_chef, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
           [project.id, project.title, project.description, project.ownerId, project.serviceId,
            project.budget, project.durationDays, project.deadline, project.validatedByChef, project.createdAt]);
  }
  console.log(`✅ Inserted ${projects.length} projects`);

  // === TASKS ===
  const taskStates = ['en_attente', 'en_cours', 'validee', 'non_validee'];
  const taskTitles = ['Analyse des besoins', 'Conception technique', 'Développement', 'Tests unitaires',
                     'Intégration', 'Déploiement', 'Documentation', 'Formation utilisateurs'];

  let taskCount = 0;
  const allTasks = [];
  projects.forEach((project, pIdx) => {
    const numTasks = Math.floor(Math.random() * 5) + 3;
    for (let t = 0; t < numTasks; t++) {
      const taskId = `task-${pIdx + 1}-${t + 1}`;
      const state = taskStates[Math.floor(Math.random() * taskStates.length)];
      const finalDate = new Date(Date.now() + (Math.random() * 90 + 15) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      db.run(`INSERT INTO tasks (id, project_id, title, description, final_date, duration_days, state, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
             [taskId, project.id, taskTitles[t % taskTitles.length],
              `Description de la tâche ${t + 1}`, finalDate, Math.floor(Math.random() * 30) + 5, state, now]);

      allTasks.push({ id: taskId, projectId: project.id, state });

      // Add some validations for validated tasks
      if (state === 'validee') {
        const validators = employees.filter(e => e.serviceId === project.serviceId && e.role === 'employe');
        validators.slice(0, 2).forEach(v => {
          try {
            db.run(`INSERT INTO task_validations (task_id, employee_id, validation_type, validated_at) VALUES (?, ?, ?, ?)`,
                   [taskId, v.id, 'validated', now]);
          } catch(e) {}
        });
      }
      taskCount++;
    }
  });
  console.log(`✅ Inserted ${taskCount} tasks with validations`);

  // === COMMENTS ===
  const commentTypes = ['urgent', 'quotidien', 'informatif'];
  const commentContents = [
    'Besoin de clarification sur ce point',
    'À revoir avec le client',
    'Validation en attente du responsable',
    'Documentation mise à jour',
    'Tests en cours',
    'Point bloquant identifié'
  ];

  let commentCount = 0;
  allTasks.slice(0, 30).forEach((task, idx) => {
    const project = projects.find(p => p.id === task.projectId);
    const user = employees.find(e => e.serviceId === project?.serviceId);
    if (user) {
      db.run(`INSERT INTO comments (id, task_id, user_id, content, type, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
             [`cmt-${idx + 1}`, task.id, user.id, commentContents[idx % commentContents.length],
              commentTypes[idx % commentTypes.length], now]);
      commentCount++;
    }
  });
  console.log(`✅ Inserted ${commentCount} comments`);

  // === ACTIVITY LOGS ===
  projects.slice(0, 10).forEach((project, idx) => {
    const actor = employees.find(e => e.id === project.ownerId);
    db.run(`INSERT INTO activity_logs (id, project_id, actor_id, actor_name, action, details, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
           [`log-${idx + 1}`, project.id, actor.id, actor.name, 'project_created',
            `Projet "${project.title}" créé`, now]);
  });
  console.log('✅ Inserted activity logs');

  // Save database to file
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);

  db.close();
  console.log('\n🎉 Database seeded successfully!');
}

seedDatabase().catch(console.error);

