export type ActivityAction =
  | 'project_created'
  | 'project_updated'
  | 'project_validated'
  | 'project_invalidated'
  | 'task_created'
  | 'task_updated'
  | 'task_validated'
  | 'task_marked_not_pertinent'
  | 'task_deleted'
  | 'comment_added'
  | 'cps_uploaded'
  | 'cps_replaced';

export interface ActivityLog {
  id: string;
  projectId: string;
  actorId: string;
  actorName: string;
  action: ActivityAction;
  details?: string;
  timestamp: string;
}

