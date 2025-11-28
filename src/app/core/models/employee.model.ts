export type Role = 'employe' | 'chef';
export interface Employee {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  serviceId: string;
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

