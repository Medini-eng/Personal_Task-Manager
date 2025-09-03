import { Task } from '../types';
import { differenceInMinutes } from 'date-fns';

export const checkDeadlines = (tasks: Task[]): Task[] => {
  const now = new Date();
  return tasks.filter(task => {
    if (task.status === 'completed') return false;
    
    const deadline = new Date(task.deadline);
    const minutesUntilDeadline = differenceInMinutes(deadline, now);
    
    // Notify for tasks due within the next hour
    return minutesUntilDeadline >= 0 && minutesUntilDeadline <= 60;
  });
};

export const getNotificationMessage = (task: Task): string => {
  const deadline = new Date(task.deadline);
  const minutesUntilDeadline = differenceInMinutes(deadline, new Date());
  
  if (minutesUntilDeadline < 0) {
    return `Task "${task.title}" is overdue!`;
  }
  
  if (minutesUntilDeadline === 0) {
    return `Task "${task.title}" is due now!`;
  }
  
  return `Task "${task.title}" is due in ${minutesUntilDeadline} minutes`;
}; 