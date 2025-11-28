import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SeedService {
  constructor() {}

  seed() {
    // With the SQL backend, seeding is done via backend/seed-db.js
    // This service now only logs that the app is ready
    console.log('App initialized. Data is loaded from SQL database.');
    console.log('Demo credentials: chef@demo.com / Demo123! (Chef) or employe@demo.com / Demo123! (Employé)');
  }
}

