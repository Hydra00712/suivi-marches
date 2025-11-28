/**
 * Database Initialization Script
 * Creates all tables as defined in DOSSIER_DE_CONCEPTION
 * Uses sql.js (pure JavaScript SQLite)
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'suivi_marches.db');

async function initDatabase() {
  console.log('🗄️  Initializing database...\n');

  const SQL = await initSqlJs();
  const db = new SQL.Database();

  // Drop existing tables (for fresh start)
  const dropTables = `
  DROP TABLE IF EXISTS activity_logs;
  DROP TABLE IF EXISTS notifications;
  DROP TABLE IF EXISTS comments;
  DROP TABLE IF EXISTS task_validations;
  DROP TABLE IF EXISTS tasks;
  DROP TABLE IF EXISTS cahiers_de_charge;
  DROP TABLE IF EXISTS projects;
  DROP TABLE IF EXISTS employees;
  DROP TABLE IF EXISTS services;
  `;
  db.run(dropTables);
  console.log('✅ Dropped existing tables');

  // Create Services table
  db.run(`
  CREATE TABLE services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
  );
  `);
  console.log('✅ Created table: services');

  // Create Employees table
  db.run(`
  CREATE TABLE employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('employe', 'chef')) NOT NULL,
      service_id TEXT,
      avatar TEXT,
      is_active INTEGER DEFAULT 1,
      failed_login_attempts INTEGER DEFAULT 0,
      locked_until TEXT,
      created_at TEXT,
      last_login_at TEXT
  );
  `);
  console.log('✅ Created table: employees');

  // Create Projects table
  db.run(`
  CREATE TABLE projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      owner_id TEXT,
      service_id TEXT,
      budget REAL,
      duration_days INTEGER,
      deadline TEXT,
      validated_by_chef INTEGER DEFAULT 0,
      created_at TEXT
  );
  `);
  console.log('✅ Created table: projects');

  // Create Cahiers de Charge table
  db.run(`
  CREATE TABLE cahiers_de_charge (
      id TEXT PRIMARY KEY,
      project_id TEXT UNIQUE,
      file_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      base64_content TEXT NOT NULL,
      uploaded_at TEXT
  );
  `);
  console.log('✅ Created table: cahiers_de_charge');

  // Create Tasks table
  db.run(`
  CREATE TABLE tasks (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      final_date TEXT,
      duration_days INTEGER,
      state TEXT DEFAULT 'en_attente',
      created_at TEXT
  );
  `);
  console.log('✅ Created table: tasks');

  // Create Task Validations table (Many-to-Many)
  db.run(`
  CREATE TABLE task_validations (
      task_id TEXT,
      employee_id TEXT,
      validation_type TEXT NOT NULL,
      validated_at TEXT,
      PRIMARY KEY (task_id, employee_id)
  );
  `);
  console.log('✅ Created table: task_validations');

  // Create Comments table
  db.run(`
  CREATE TABLE comments (
      id TEXT PRIMARY KEY,
      task_id TEXT,
      user_id TEXT,
      content TEXT NOT NULL,
      type TEXT NOT NULL,
      created_at TEXT
  );
  `);
  console.log('✅ Created table: comments');

  // Create Notifications table
  db.run(`
  CREATE TABLE notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT,
      related_project_id TEXT,
      related_task_id TEXT,
      read INTEGER DEFAULT 0,
      created_at TEXT
  );
  `);
  console.log('✅ Created table: notifications');

  // Create Activity Logs table
  db.run(`
  CREATE TABLE activity_logs (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      actor_id TEXT,
      actor_name TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT,
      timestamp TEXT
  );
  `);
  console.log('✅ Created table: activity_logs');

  // Create indexes for performance
  db.run(`CREATE INDEX idx_employees_email ON employees(email);`);
  db.run(`CREATE INDEX idx_employees_service ON employees(service_id);`);
  db.run(`CREATE INDEX idx_projects_owner ON projects(owner_id);`);
  db.run(`CREATE INDEX idx_projects_service ON projects(service_id);`);
  db.run(`CREATE INDEX idx_tasks_project ON tasks(project_id);`);
  db.run(`CREATE INDEX idx_comments_task ON comments(task_id);`);
  db.run(`CREATE INDEX idx_notifications_user ON notifications(user_id);`);
  db.run(`CREATE INDEX idx_activity_logs_project ON activity_logs(project_id);`);
  console.log('✅ Created indexes');

  // Save database to file
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);

  db.close();
  console.log('\n🎉 Database initialized successfully!');
  console.log(`📁 Database file: ${dbPath}`);
}

initDatabase().catch(console.error);

