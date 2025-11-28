/**
 * API Test Script
 * Tests all endpoints to ensure they work correctly
 */

const http = require('http');

const BASE_URL = 'http://localhost:3002';

const test = async (name, fn) => {
  try {
    await fn();
    console.log(`✅ ${name}`);
    return true;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    return false;
  }
};

const request = (method, path, body = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(json.error || `HTTP ${res.statusCode}`));
          } else {
            resolve(json);
          }
        } catch {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const runTests = async () => {
  console.log('\n🧪 Running API Tests...\n');
  console.log('='.repeat(50));
  
  let passed = 0;
  let failed = 0;

  // Test Services
  let services;
  if (await test('GET /api/services', async () => {
    services = await request('GET', '/api/services');
    if (!Array.isArray(services)) throw new Error('Expected array');
    if (services.length === 0) throw new Error('No services found');
  })) passed++; else failed++;

  // Test Employees
  let employees;
  if (await test('GET /api/employees', async () => {
    employees = await request('GET', '/api/employees');
    if (!Array.isArray(employees)) throw new Error('Expected array');
    if (employees.length === 0) throw new Error('No employees found');
  })) passed++; else failed++;

  // Test Login (valid)
  let loggedInUser;
  if (await test('POST /api/auth/login (valid)', async () => {
    loggedInUser = await request('POST', '/api/auth/login', {
      email: 'chef@demo.com',
      password: 'Demo123!'
    });
    if (!loggedInUser.id) throw new Error('No user ID returned');
    if (loggedInUser.role !== 'chef') throw new Error('Wrong role');
  })) passed++; else failed++;

  // Test Login (invalid)
  if (await test('POST /api/auth/login (invalid)', async () => {
    try {
      await request('POST', '/api/auth/login', {
        email: 'chef@demo.com',
        password: 'wrongpassword'
      });
      throw new Error('Should have failed');
    } catch (e) {
      if (!e.message.includes('incorrect')) throw e;
    }
  })) passed++; else failed++;

  // Test Projects
  let projects;
  if (await test('GET /api/projects', async () => {
    projects = await request('GET', '/api/projects');
    if (!Array.isArray(projects)) throw new Error('Expected array');
    if (projects.length === 0) throw new Error('No projects found');
  })) passed++; else failed++;

  // Test Single Project
  if (await test('GET /api/projects/:id', async () => {
    const project = await request('GET', `/api/projects/${projects[0].id}`);
    if (!project.id) throw new Error('No project ID');
    if (!project.title) throw new Error('No title');
  })) passed++; else failed++;

  // Test Tasks
  let tasks;
  if (await test('GET /api/tasks', async () => {
    tasks = await request('GET', '/api/tasks');
    if (!Array.isArray(tasks)) throw new Error('Expected array');
    if (tasks.length === 0) throw new Error('No tasks found');
  })) passed++; else failed++;

  // Test Tasks by Project
  if (await test('GET /api/tasks?projectId=...', async () => {
    const projectTasks = await request('GET', `/api/tasks?projectId=${projects[0].id}`);
    if (!Array.isArray(projectTasks)) throw new Error('Expected array');
  })) passed++; else failed++;

  // Test Comments
  if (await test('GET /api/comments', async () => {
    const comments = await request('GET', '/api/comments');
    if (!Array.isArray(comments)) throw new Error('Expected array');
  })) passed++; else failed++;

  // Test Notifications
  if (await test('GET /api/notifications', async () => {
    const notifications = await request('GET', '/api/notifications');
    if (!Array.isArray(notifications)) throw new Error('Expected array');
  })) passed++; else failed++;

  // Test Activity Logs
  if (await test('GET /api/activity-logs', async () => {
    const logs = await request('GET', '/api/activity-logs');
    if (!Array.isArray(logs)) throw new Error('Expected array');
  })) passed++; else failed++;

  // Test Stats Overview
  if (await test('GET /api/stats/overview', async () => {
    const stats = await request('GET', '/api/stats/overview');
    if (typeof stats.totalProjects !== 'number') throw new Error('Missing totalProjects');
    if (typeof stats.totalTasks !== 'number') throw new Error('Missing totalTasks');
  })) passed++; else failed++;

  // Test Top Projects
  if (await test('GET /api/stats/top-projects', async () => {
    const top = await request('GET', '/api/stats/top-projects');
    if (!Array.isArray(top)) throw new Error('Expected array');
  })) passed++; else failed++;

  // Test Create Project
  let newProjectId;
  if (await test('POST /api/projects (create)', async () => {
    const newProject = await request('POST', '/api/projects', {
      title: 'Test Project API',
      description: 'Created via API test',
      ownerId: employees[0].id,
      serviceId: services[0].id,
      budget: 50000,
      durationDays: 30,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    if (!newProject.id) throw new Error('No project ID returned');
    if (newProject.title !== 'Test Project API') throw new Error('Title mismatch');
    newProjectId = newProject.id;
  })) passed++; else failed++;

  // Test Create Task
  if (await test('POST /api/tasks (create)', async () => {
    const newTask = await request('POST', '/api/tasks', {
      projectId: newProjectId || projects[0].id,
      title: 'Test Task API',
      description: 'Created via API test',
      assignedTo: employees[0].id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    if (!newTask.id) throw new Error('No task ID returned');
    if (newTask.title !== 'Test Task API') throw new Error('Title mismatch');
  })) passed++; else failed++;

  console.log('='.repeat(50));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  console.log(failed === 0 ? '\n🎉 All tests passed!' : '\n⚠️  Some tests failed');
};

runTests().catch(console.error);

