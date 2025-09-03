import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Typography,
  Paper,
  Box,
  Chip,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  onStatusChange: (taskId: string, status: 'pending' | 'completed') => void;
  onDelete: (taskId: string) => void;
  onSelect: (taskId: string) => void;
  selectedTaskId: string | null;
  getPriorityColor: (priority: string) => 'error' | 'warning' | 'success' | 'default';
  onEdit: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onStatusChange,
  onDelete,
  onSelect,
  selectedTaskId,
  getPriorityColor,
  onEdit,
}) => {
  const sortedTasks = [...tasks].sort((a, b) => {
    // First sort by status (pending first)
    if (a.status !== b.status) {
      return a.status === 'pending' ? -1 : 1;
    }
    // Then sort by priority (high to low)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (a.priority !== b.priority) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    // Finally sort by deadline
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  return (
    <List>
      {sortedTasks.length === 0 ? (
        <Typography variant="body1" color="text.secondary" align="center">
          No tasks found. Add a new task to get started!
        </Typography>
      ) : (
        sortedTasks.map((task) => (
          <Paper
            key={task._id}
            elevation={1}
            sx={{
              mb: 2,
              backgroundColor: task.status === 'completed' ? '#f5f5f5' : 'white',
              border: selectedTaskId === task._id ? '2px solid #1976d2' : 'none',
              cursor: 'pointer',
            }}
            onClick={() => onSelect(task._id)}
          >
            <ListItem>
              <Checkbox
                edge="start"
                checked={task.status === 'completed'}
                onChange={(e) => {
                  e.stopPropagation();
                  onStatusChange(task._id, task.status === 'completed' ? 'pending' : 'completed');
                }}
              />
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="h6"
                      style={{
                        textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                      }}
                    >
                      {task.title}
                    </Typography>
                    <Chip
                      label={task.priority}
                      size="small"
                      sx={{
                        color: task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'goldenrod' : 'green',
                        borderColor: task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'goldenrod' : 'green',
                        borderWidth: 1,
                        borderStyle: 'solid',
                        backgroundColor: 'transparent',
                      }}
                    />
                    {task.category && (
                      <Chip
                        label={task.category}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {task.description}
                    </Typography>
                    <Typography variant="caption" color="error">
                      Deadline: {format(new Date(task.deadline), 'PPp')}
                    </Typography>
                    {task.completedAt && (
                      <Typography variant="caption" color="success.main" sx={{ ml: 2 }}>
                        Completed: {format(new Date(task.completedAt), 'PPp')}
                      </Typography>
                    )}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={e => {
                    e.stopPropagation();
                    onEdit(task);
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task._id);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </Paper>
        ))
      )}
    </List>
  );
};

export default TaskList; 