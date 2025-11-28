/**
 * Suivi Marchés API Server
 * Express + SQLite Backend (using sql.js)
 */

const express = require('express');
const cors = require('cors');
const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;
const dbPath = path.join(__dirname, 'suivi_marches.db');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

let db = null;

// ============================================
// HELPER FUNCTIONS
// ============================================

const hashPassword = (password) => bcrypt.hashSync(password, 10);
const comparePassword = (password, hash) => bcrypt.compareSync(password, hash);

// Convert DB row to camelCase
const toCamelCase = (row) => {
  if (!row) return null;
  const result = {};
  for (const key in row) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = row[key];
  }
  return result;
};

// Helper to run query and get all results
const queryAll = (sql, params = []) => {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
};

// Helper to run query and get one result
const queryOne = (sql, params = []) => {
  const results = queryAll(sql, params);
  return results.length > 0 ? results[0] : null;
};

// Helper to run insert/update/delete
const run = (sql, params = []) => {
  // Replace undefined with null for sql.js compatibility
  const safeParams = params.map(p => p === undefined ? null : p);
  db.run(sql, safeParams);
};

// Save database to file
const saveDb = () => {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
};

// ============================================
// AUTH ROUTES
// ============================================

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  const employee = queryOne('SELECT * FROM employees WHERE email = ?', [email]);

  if (!employee) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  if (employee.locked_until && new Date(employee.locked_until) > new Date()) {
    return res.status(403).json({ error: 'Compte verrouillé. Réessayez plus tard.' });
  }

  if (!comparePassword(password, employee.password_hash)) {
    const attempts = (employee.failed_login_attempts || 0) + 1;
    const lockUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;

    run('UPDATE employees SET failed_login_attempts = ?, locked_until = ? WHERE id = ?',
        [attempts, lockUntil, employee.id]);
    saveDb();

    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  // Reset failed attempts and update last login
  run('UPDATE employees SET failed_login_attempts = 0, locked_until = NULL, last_login_at = ? WHERE id = ?',
      [new Date().toISOString(), employee.id]);
  saveDb();

  const { password_hash, ...user } = employee;
  res.json(toCamelCase(user));
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role, serviceId } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nom, email et mot de passe sont requis' });
  }
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Email invalide' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
  }

  const existing = queryOne('SELECT id FROM employees WHERE email = ?', [email]);
  if (existing) {
    return res.status(400).json({ error: 'Email déjà utilisé' });
  }

  const id = uuidv4();
  const userRole = role || 'employe';
  run(`INSERT INTO employees (id, name, email, password_hash, role, service_id, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
      [id, name, email, hashPassword(password), userRole, serviceId, new Date().toISOString()]);
  saveDb();

  const user = queryOne('SELECT * FROM employees WHERE id = ?', [id]);
  const { password_hash, ...userData } = user;
  res.status(201).json(toCamelCase(userData));
});

// ============================================
// SERVICES ROUTES
// ============================================

app.get('/api/services', (req, res) => {
  const services = queryAll('SELECT * FROM services');
  res.json(services.map(toCamelCase));
});

// ============================================
// EMPLOYEES ROUTES
// ============================================

app.get('/api/employees', (req, res) => {
  const employees = queryAll('SELECT id, name, email, role, service_id, avatar, is_active, created_at FROM employees');
  res.json(employees.map(toCamelCase));
});

app.get('/api/employees/:id', (req, res) => {
  const employee = queryOne('SELECT id, name, email, role, service_id, avatar, is_active, created_at FROM employees WHERE id = ?',
                            [req.params.id]);
  if (!employee) return res.status(404).json({ error: 'Employé non trouvé' });
  res.json(toCamelCase(employee));
});

app.get('/api/employees/service/:serviceId', (req, res) => {
  const employees = queryAll('SELECT id, name, email, role, service_id, avatar, is_active FROM employees WHERE service_id = ?',
                             [req.params.serviceId]);
  res.json(employees.map(toCamelCase));
});

// ============================================
// PROJECTS ROUTES
// ============================================

app.get('/api/projects', (req, res) => {
  const projects = queryAll('SELECT * FROM projects ORDER BY created_at DESC');

  // Add cahier info
  const projectsWithCahier = projects.map(p => {
    const cahier = queryOne('SELECT file_name, mime_type, size FROM cahiers_de_charge WHERE project_id = ?', [p.id]);
    return { ...toCamelCase(p), cahier: cahier ? toCamelCase(cahier) : null };
  });

  res.json(projectsWithCahier);
});

app.get('/api/projects/:id', (req, res) => {
  const project = queryOne('SELECT * FROM projects WHERE id = ?', [req.params.id]);
  if (!project) return res.status(404).json({ error: 'Projet non trouvé' });

  const cahier = queryOne('SELECT * FROM cahiers_de_charge WHERE project_id = ?', [project.id]);
  res.json({ ...toCamelCase(project), cahier: cahier ? toCamelCase(cahier) : null });
});

app.post('/api/projects', (req, res) => {
  const { title, description, ownerId, serviceId, budget, durationDays, deadline, cahier } = req.body;
  const id = uuidv4();

  run(`INSERT INTO projects (id, title, description, owner_id, service_id, budget, duration_days, deadline, validated_by_chef, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
      [id, title, description, ownerId, serviceId, budget, durationDays, deadline, new Date().toISOString()]);

  // Save cahier if provided
  if (cahier) {
    run(`INSERT INTO cahiers_de_charge (id, project_id, file_name, mime_type, size, base64_content, uploaded_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), id, cahier.fileName, cahier.mimeType, cahier.size, cahier.base64, new Date().toISOString()]);
  }
  saveDb();

  const project = queryOne('SELECT * FROM projects WHERE id = ?', [id]);
  res.status(201).json({ ...toCamelCase(project), cahier });
});

app.put('/api/projects/:id', (req, res) => {
  const { title, description, budget, durationDays, deadline, validatedByChef, cahier } = req.body;

  run(`UPDATE projects SET title = ?, description = ?, budget = ?, duration_days = ?, deadline = ?, validated_by_chef = ?
       WHERE id = ?`,
      [title, description, budget, durationDays, deadline, validatedByChef ? 1 : 0, req.params.id]);

  // Update cahier if provided
  if (cahier) {
    run('DELETE FROM cahiers_de_charge WHERE project_id = ?', [req.params.id]);
    run(`INSERT INTO cahiers_de_charge (id, project_id, file_name, mime_type, size, base64_content, uploaded_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), req.params.id, cahier.fileName, cahier.mimeType, cahier.size, cahier.base64, new Date().toISOString()]);
  }
  saveDb();

  const project = queryOne('SELECT * FROM projects WHERE id = ?', [req.params.id]);
  const cahierData = queryOne('SELECT * FROM cahiers_de_charge WHERE project_id = ?', [req.params.id]);
  res.json({ ...toCamelCase(project), cahier: cahierData ? toCamelCase(cahierData) : null });
});

app.delete('/api/projects/:id', (req, res) => {
  run('DELETE FROM cahiers_de_charge WHERE project_id = ?', [req.params.id]);
  run('DELETE FROM tasks WHERE project_id = ?', [req.params.id]);
  run('DELETE FROM activity_logs WHERE project_id = ?', [req.params.id]);
  run('DELETE FROM projects WHERE id = ?', [req.params.id]);
  saveDb();
  res.json({ success: true });
});

app.patch('/api/projects/:id/validate', (req, res) => {
  run('UPDATE projects SET validated_by_chef = 1 WHERE id = ?', [req.params.id]);
  saveDb();
  const project = queryOne('SELECT * FROM projects WHERE id = ?', [req.params.id]);
  res.json(toCamelCase(project));
});

// ============================================
// TASKS ROUTES
// ============================================

app.get('/api/tasks', (req, res) => {
  const { projectId } = req.query;
  let tasks;

  if (projectId) {
    tasks = queryAll('SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at', [projectId]);
  } else {
    tasks = queryAll('SELECT * FROM tasks ORDER BY created_at');
  }

  // Add validations
  const tasksWithValidations = tasks.map(t => {
    const validations = queryAll('SELECT employee_id, validation_type FROM task_validations WHERE task_id = ?', [t.id]);
    return {
      ...toCamelCase(t),
      validatedBy: validations.filter(v => v.validation_type === 'validated').map(v => v.employee_id),
      notPertinentBy: validations.filter(v => v.validation_type === 'not_pertinent').map(v => v.employee_id)
    };
  });

  res.json(tasksWithValidations);
});

app.get('/api/tasks/:id', (req, res) => {
  const task = queryOne('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
  if (!task) return res.status(404).json({ error: 'Tâche non trouvée' });

  const validations = queryAll('SELECT employee_id, validation_type FROM task_validations WHERE task_id = ?', [task.id]);
  res.json({
    ...toCamelCase(task),
    validatedBy: validations.filter(v => v.validation_type === 'validated').map(v => v.employee_id),
    notPertinentBy: validations.filter(v => v.validation_type === 'not_pertinent').map(v => v.employee_id)
  });
});

app.post('/api/tasks', (req, res) => {
  const { projectId, title, description, finalDate, durationDays, state } = req.body;
  const id = uuidv4();

  run(`INSERT INTO tasks (id, project_id, title, description, final_date, duration_days, state, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, projectId, title, description || '', finalDate, durationDays, state || 'en_attente', new Date().toISOString()]);
  saveDb();

  const task = queryOne('SELECT * FROM tasks WHERE id = ?', [id]);
  res.status(201).json({ ...toCamelCase(task), validatedBy: [], notPertinentBy: [] });
});

app.put('/api/tasks/:id', (req, res) => {
  const { title, description, finalDate, durationDays, state } = req.body;

  run(`UPDATE tasks SET title = ?, description = ?, final_date = ?, duration_days = ?, state = ?
       WHERE id = ?`,
      [title, description, finalDate, durationDays, state, req.params.id]);
  saveDb();

  const task = queryOne('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
  const validations = queryAll('SELECT employee_id, validation_type FROM task_validations WHERE task_id = ?', [task.id]);
  res.json({
    ...toCamelCase(task),
    validatedBy: validations.filter(v => v.validation_type === 'validated').map(v => v.employee_id),
    notPertinentBy: validations.filter(v => v.validation_type === 'not_pertinent').map(v => v.employee_id)
  });
});

app.delete('/api/tasks/:id', (req, res) => {
  run('DELETE FROM task_validations WHERE task_id = ?', [req.params.id]);
  run('DELETE FROM comments WHERE task_id = ?', [req.params.id]);
  run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
  saveDb();
  res.json({ success: true });
});

app.post('/api/tasks/:id/validate', (req, res) => {
  const { employeeId } = req.body;

  try {
    // Delete existing validation first, then insert
    run('DELETE FROM task_validations WHERE task_id = ? AND employee_id = ?', [req.params.id, employeeId]);
    run(`INSERT INTO task_validations (task_id, employee_id, validation_type, validated_at)
         VALUES (?, ?, 'validated', ?)`,
        [req.params.id, employeeId, new Date().toISOString()]);
    saveDb();
  } catch (e) {}

  const task = queryOne('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
  const validations = queryAll('SELECT employee_id, validation_type FROM task_validations WHERE task_id = ?', [task.id]);
  res.json({
    ...toCamelCase(task),
    validatedBy: validations.filter(v => v.validation_type === 'validated').map(v => v.employee_id),
    notPertinentBy: validations.filter(v => v.validation_type === 'not_pertinent').map(v => v.employee_id)
  });
});

app.post('/api/tasks/:id/not-pertinent', (req, res) => {
  const { employeeId } = req.body;

  try {
    // Delete existing validation first, then insert
    run('DELETE FROM task_validations WHERE task_id = ? AND employee_id = ?', [req.params.id, employeeId]);
    run(`INSERT INTO task_validations (task_id, employee_id, validation_type, validated_at)
         VALUES (?, ?, 'not_pertinent', ?)`,
        [req.params.id, employeeId, new Date().toISOString()]);
    saveDb();
  } catch (e) {}

  const task = queryOne('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
  const validations = queryAll('SELECT employee_id, validation_type FROM task_validations WHERE task_id = ?', [task.id]);
  res.json({
    ...toCamelCase(task),
    validatedBy: validations.filter(v => v.validation_type === 'validated').map(v => v.employee_id),
    notPertinentBy: validations.filter(v => v.validation_type === 'not_pertinent').map(v => v.employee_id)
  });
});

// ============================================
// COMMENTS ROUTES
// ============================================

app.get('/api/comments', (req, res) => {
  const { taskId } = req.query;
  let comments;

  if (taskId) {
    comments = queryAll('SELECT * FROM comments WHERE task_id = ? ORDER BY created_at DESC', [taskId]);
  } else {
    comments = queryAll('SELECT * FROM comments ORDER BY created_at DESC');
  }

  res.json(comments.map(toCamelCase));
});

app.post('/api/comments', (req, res) => {
  const { taskId, userId, content, type } = req.body;
  const id = uuidv4();

  run(`INSERT INTO comments (id, task_id, user_id, content, type, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, taskId, userId, content, type, new Date().toISOString()]);
  saveDb();

  const comment = queryOne('SELECT * FROM comments WHERE id = ?', [id]);
  res.status(201).json(toCamelCase(comment));
});

app.delete('/api/comments/:id', (req, res) => {
  run('DELETE FROM comments WHERE id = ?', [req.params.id]);
  saveDb();
  res.json({ success: true });
});

// ============================================
// NOTIFICATIONS ROUTES
// ============================================

app.get('/api/notifications', (req, res) => {
  const { userId } = req.query;
  let notifications;

  if (userId) {
    notifications = queryAll('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  } else {
    notifications = queryAll('SELECT * FROM notifications ORDER BY created_at DESC');
  }

  res.json(notifications.map(toCamelCase));
});

app.post('/api/notifications', (req, res) => {
  const { userId, type, title, message, relatedProjectId, relatedTaskId } = req.body;
  const id = uuidv4();

  run(`INSERT INTO notifications (id, user_id, type, title, message, related_project_id, related_task_id, read, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
      [id, userId, type, title, message, relatedProjectId || null, relatedTaskId || null, new Date().toISOString()]);
  saveDb();

  const notification = queryOne('SELECT * FROM notifications WHERE id = ?', [id]);
  res.status(201).json(toCamelCase(notification));
});

app.patch('/api/notifications/:id/read', (req, res) => {
  run('UPDATE notifications SET read = 1 WHERE id = ?', [req.params.id]);
  saveDb();
  const notification = queryOne('SELECT * FROM notifications WHERE id = ?', [req.params.id]);
  res.json(toCamelCase(notification));
});

app.patch('/api/notifications/read-all', (req, res) => {
  const { userId } = req.body;
  run('UPDATE notifications SET read = 1 WHERE user_id = ?', [userId]);
  saveDb();
  res.json({ success: true });
});

// ============================================
// ACTIVITY LOGS ROUTES
// ============================================

app.get('/api/activity-logs', (req, res) => {
  const { projectId } = req.query;
  let logs;

  if (projectId) {
    logs = queryAll('SELECT * FROM activity_logs WHERE project_id = ? ORDER BY timestamp DESC', [projectId]);
  } else {
    logs = queryAll('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 100');
  }

  res.json(logs.map(toCamelCase));
});

app.post('/api/activity-logs', (req, res) => {
  const { projectId, actorId, actorName, action, details } = req.body;
  const id = uuidv4();

  run(`INSERT INTO activity_logs (id, project_id, actor_id, actor_name, action, details, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, projectId, actorId, actorName, action, details, new Date().toISOString()]);
  saveDb();

  const log = queryOne('SELECT * FROM activity_logs WHERE id = ?', [id]);
  res.status(201).json(toCamelCase(log));
});

// ============================================
// STATS ROUTES (for Dashboard)
// ============================================

app.get('/api/stats/overview', (req, res) => {
  const totalProjects = queryOne('SELECT COUNT(*) as count FROM projects').count;
  const totalTasks = queryOne('SELECT COUNT(*) as count FROM tasks').count;
  const totalEmployees = queryOne('SELECT COUNT(*) as count FROM employees WHERE role = "employe"').count;
  const totalBudget = queryOne('SELECT SUM(budget) as total FROM projects').total || 0;

  const tasksByState = queryAll('SELECT state, COUNT(*) as count FROM tasks GROUP BY state');

  const projectsByMonth = queryAll(`
    SELECT substr(created_at, 1, 7) as month, COUNT(*) as count
    FROM projects
    GROUP BY month
    ORDER BY month DESC
    LIMIT 12
  `);

  res.json({
    totalProjects,
    totalTasks,
    totalEmployees,
    totalBudget,
    tasksByState: tasksByState.reduce((acc, t) => ({ ...acc, [t.state]: t.count }), {}),
    projectsByMonth
  });
});

app.get('/api/stats/top-projects', (req, res) => {
  const projects = queryAll(`
    SELECT p.*,
           (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as total_tasks,
           (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.state = 'validee') as validated_tasks
    FROM projects p
    ORDER BY validated_tasks DESC
    LIMIT 5
  `);

  res.json(projects.map(p => ({
    ...toCamelCase(p),
    completionRate: p.total_tasks > 0 ? Math.round((p.validated_tasks / p.total_tasks) * 100) : 0
  })));
});

// ============================================
// CAHIERS DE CHARGE ROUTES
// ============================================

app.get('/api/cahiers/:projectId', (req, res) => {
  const cahier = queryOne('SELECT * FROM cahiers_de_charge WHERE project_id = ?', [req.params.projectId]);
  if (!cahier) return res.status(404).json({ error: 'Cahier non trouvé' });
  res.json(toCamelCase(cahier));
});

// ============================================
// START SERVER
// ============================================

async function startServer() {
  const SQL = await initSqlJs();

  // Load or create database
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
    console.log('📦 Database loaded from file');
  } else {
    console.log('❌ Database not found. Run: node init-db.js && node seed-db.js');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 API Server running on http://localhost:${PORT}`);
    console.log('📋 Available endpoints:');
    console.log('   POST /api/auth/login');
    console.log('   POST /api/auth/register');
    console.log('   GET  /api/services');
    console.log('   GET  /api/employees');
    console.log('   GET  /api/projects');
    console.log('   GET  /api/tasks');
    console.log('   GET  /api/comments');
    console.log('   GET  /api/notifications');
    console.log('   GET  /api/activity-logs');
    console.log('   GET  /api/stats/overview');
  });
}

startServer().catch(console.error);

