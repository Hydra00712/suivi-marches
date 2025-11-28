export type TaskState = 'en_attente'|'en_cours'|'validee'|'non_validee';
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  finalDate: string; // ISO date
  durationDays: number;
  state: TaskState;
  validatedBy: string[]; // employee ids
  notPertinentBy: string[]; // employee ids
}

