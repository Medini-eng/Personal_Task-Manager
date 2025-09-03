import { Task } from '../types';

const API_URL = 'http://localhost:5000/api';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

type CreateTaskData = Omit<Task, '_id' | 'createdAt' | 'completedAt'>;
type UpdateTaskData = Partial<Omit<Task, '_id' | 'createdAt'>>;

export const api = {
  async getTasks(): Promise<Task[]> {
    try {
      const response = await fetch(`${API_URL}/tasks`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  async getTaskHistory(params?: { status?: string; startDate?: string; endDate?: string }): Promise<Task[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);

      const response = await fetch(`${API_URL}/tasks/history?${queryParams.toString()}`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching task history:', error);
      throw error;
    }
  },

  async createTask(task: CreateTaskData): Promise<Task> {
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  async updateTask(id: string, task: UpdateTaskData): Promise<Task> {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  async deleteTask(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },
}; 