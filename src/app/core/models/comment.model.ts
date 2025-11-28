export type CommentType = 'urgent' | 'quotidien' | 'informatif';
export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  type: CommentType;
  createdAt: string;
}

