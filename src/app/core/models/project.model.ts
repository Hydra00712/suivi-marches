import { CahierDeCharge } from './cahier.model';

export interface Project {
  id: string;
  title: string;
  description: string;
  serviceId: string;
  ownerId: string;
  budget: number;
  durationDays: number;
  deadline: string; // ISO date
  cahier: CahierDeCharge | null;
  validatedByChef: boolean;
  createdAt: string;
}

