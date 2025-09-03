export interface Task {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  type: 'personal' | 'company';
  status: 'pending' | 'completed';
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  completedAt?: string;
} 