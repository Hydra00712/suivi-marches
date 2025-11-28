export type NotificationType = 'deadline' | 'info';
export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedTaskId?: string;
  relatedProjectId?: string;
  read: boolean;
  createdAt: string;
}

