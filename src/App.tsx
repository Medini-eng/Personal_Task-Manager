import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Badge,
  Card,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Notifications as NotificationsIcon,
  FilterList as FilterIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  List as ListIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import TaskList from './components/TaskList';
import { Task } from './types';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { checkDeadlines, getNotificationMessage } from './services/notificationService';
import { api } from './services/api';
import { format, startOfDay, endOfDay, isAfter, isBefore, addDays } from 'date-fns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`task-tabpanel-${index}`}
      aria-labelledby={`task-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [tabValue, setTabValue] = useState(0);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    deadline: '',
    type: 'personal',
    status: 'pending',
    priority: 'medium',
    category: 'general',
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [historyCreatedStart, setHistoryCreatedStart] = useState<string>('');
  const [historyCreatedEnd, setHistoryCreatedEnd] = useState<string>('');
  const [historyDeadlineStart, setHistoryDeadlineStart] = useState<string>('');
  const [historyDeadlineEnd, setHistoryDeadlineEnd] = useState<string>('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const allTasks = await api.getTasks();
      setTasks(allTasks);
    } catch (error) {
      toast.error('Failed to load tasks');
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkUpcomingDeadlines = () => {
      const upcomingTasks = checkDeadlines(tasks);
      upcomingTasks.forEach(task => {
        toast(getNotificationMessage(task), {
          duration: 5000,
          position: 'top-right',
        });
      });
    };

    const interval = setInterval(checkUpcomingDeadlines, 60000);
    return () => clearInterval(interval);
  }, [tasks]);

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const taskData = {
        title: newTask.title!,
        description: newTask.description || '',
        deadline: newTask.deadline!,
        type: newTask.type as 'personal' | 'company',
        status: 'pending' as const,
        priority: newTask.priority as 'low' | 'medium' | 'high',
        category: newTask.category || 'general',
      };

      const task = await api.createTask(taskData);
      setTasks([...tasks, task]);
      setOpenDialog(false);
      setNewTask({
        title: '',
        description: '',
        deadline: '',
        type: 'personal',
        status: 'pending',
        priority: 'medium',
        category: 'general',
      });
      toast.success('Task added successfully!');
    } catch (error) {
      toast.error('Failed to add task');
      console.error('Error adding task:', error);
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: 'pending' | 'completed') => {
    try {
      const updatedTask = await api.updateTask(taskId, { 
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
      });
      setTasks(tasks.map(task =>
        task._id === taskId ? updatedTask : task
      ));
      toast.success(`Task marked as ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update task status');
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      setTasks(tasks.filter(task => task._id !== taskId));
      toast.success('Task deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete task');
      console.error('Error deleting task:', error);
    }
  };

  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getTaskStatus = (task: Task) => {
    const now = new Date();
    const deadline = new Date(task.deadline);
    
    if (task.status === 'completed') return 'completed';
    if (isAfter(now, deadline)) return 'overdue';
    if (isBefore(deadline, new Date(now.getTime() + 24 * 60 * 60 * 1000))) return 'due-soon';
    return 'upcoming';
  };

  // Filtering logic for each tab
  const personalTasks = tasks.filter(task => task.type === 'personal' && task.status !== 'completed');
  const companyTasks = tasks.filter(task => task.type === 'company' && task.status !== 'completed');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  // Only pending (not completed) tasks for All Tasks tab
  const allTasks = tasks.filter(task => task.status !== 'completed');

  // Apply additional filters if set
  const applyFilters = (taskList: Task[]) => {
    return taskList.filter(task => {
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
      return matchesPriority && matchesCategory;
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Open edit dialog
  const handleEditTaskOpen = (task: Task) => {
    setEditTask(task);
    setEditDialogOpen(true);
  };

  // Close edit dialog
  const handleEditTaskClose = () => {
    setEditDialogOpen(false);
    setEditTask(null);
  };

  // Handle edit form changes
  const handleEditTaskChange = (field: keyof Task, value: any) => {
    if (editTask) {
      setEditTask({ ...editTask, [field]: value });
    }
  };

  // Save edited task
  const handleEditTaskSave = async () => {
    if (!editTask) return;
    try {
      const updated = await api.updateTask(editTask._id, {
        title: editTask.title,
        description: editTask.description,
        deadline: editTask.deadline,
        type: editTask.type,
        priority: editTask.priority,
        category: editTask.category,
      });
      setTasks(tasks.map(t => t._id === updated._id ? updated : t));
      toast.success('Task updated successfully!');
      handleEditTaskClose();
    } catch (error) {
      toast.error('Failed to update task');
      console.error('Error updating task:', error);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            backgroundColor: '#f5f5f5',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" component="div" sx={{ mb: 2 }}>
            Task Manager
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            fullWidth
            onClick={() => setOpenDialog(true)}
            sx={{ mb: 2 }}
          >
            Add New Task
          </Button>
        </Box>
        <Divider />
        <List>
          <ListItem button onClick={() => setTabValue(0)}>
            <ListItemIcon><ListIcon /></ListItemIcon>
            <ListItemText primary="All Tasks" />
          </ListItem>
          <ListItem button onClick={() => setTabValue(1)}>
            <ListItemIcon><PersonIcon /></ListItemIcon>
            <ListItemText primary="Personal Tasks" />
          </ListItem>
          <ListItem button onClick={() => setTabValue(2)}>
            <ListItemIcon><WorkIcon /></ListItemIcon>
            <ListItemText primary="Company Tasks" />
          </ListItem>
          <ListItem button onClick={() => setTabValue(3)}>
            <ListItemIcon><HistoryIcon /></ListItemIcon>
            <ListItemText primary="Task History" />
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Grid container spacing={3}>
          {/* Task List Section */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, height: 'calc(100vh - 100px)', overflow: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">
                  {tabValue === 0 ? 'All Tasks' :
                   tabValue === 1 ? 'Personal Tasks' :
                   tabValue === 2 ? 'Company Tasks' : 'Task History'}
                </Typography>
                <IconButton onClick={() => setOpenFilter(true)}>
                  <FilterIcon />
                </IconButton>
              </Box>

              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="task tabs">
                  <Tab label="All Tasks" />
                  <Tab label="Personal Tasks" />
                  <Tab label="Company Tasks" />
                  <Tab label="Task History" />
                </Tabs>
              </Box>

              <TabPanel value={tabValue} index={0}>
                <TaskList
                  tasks={applyFilters(allTasks)}
                  onStatusChange={handleTaskStatusChange}
                  onDelete={handleDeleteTask}
                  onSelect={handleTaskSelect}
                  selectedTaskId={selectedTaskId}
                  getPriorityColor={getPriorityColor}
                  onEdit={handleEditTaskOpen}
                />
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                <TaskList
                  tasks={applyFilters(personalTasks)}
                  onStatusChange={handleTaskStatusChange}
                  onDelete={handleDeleteTask}
                  onSelect={handleTaskSelect}
                  selectedTaskId={selectedTaskId}
                  getPriorityColor={getPriorityColor}
                  onEdit={handleEditTaskOpen}
                />
              </TabPanel>
              <TabPanel value={tabValue} index={2}>
                <TaskList
                  tasks={applyFilters(companyTasks)}
                  onStatusChange={handleTaskStatusChange}
                  onDelete={handleDeleteTask}
                  onSelect={handleTaskSelect}
                  selectedTaskId={selectedTaskId}
                  getPriorityColor={getPriorityColor}
                  onEdit={handleEditTaskOpen}
                />
              </TabPanel>
              <TabPanel value={tabValue} index={3}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    label="Created From"
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={historyCreatedStart}
                    onChange={e => setHistoryCreatedStart(e.target.value)}
                  />
                  <TextField
                    label="Created To"
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={historyCreatedEnd}
                    onChange={e => setHistoryCreatedEnd(e.target.value)}
                  />
                  <TextField
                    label="Deadline From"
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={historyDeadlineStart}
                    onChange={e => setHistoryDeadlineStart(e.target.value)}
                  />
                  <TextField
                    label="Deadline To"
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={historyDeadlineEnd}
                    onChange={e => setHistoryDeadlineEnd(e.target.value)}
                  />
                </Box>
                <TaskList
                  tasks={completedTasks}
                  onStatusChange={handleTaskStatusChange}
                  onDelete={handleDeleteTask}
                  onSelect={handleTaskSelect}
                  selectedTaskId={selectedTaskId}
                  getPriorityColor={getPriorityColor}
                  onEdit={handleEditTaskOpen}
                />
              </TabPanel>
            </Paper>
          </Grid>

          {/* Right Sidebar */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: 'calc(100vh - 100px)', overflow: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Task Overview</Typography>
                <IconButton onClick={() => setOpenFilter(true)}>
                  <FilterIcon />
                </IconButton>
              </Box>
              <List>
                <ListItem>
                  <ListItemIcon><ScheduleIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Pending Tasks" 
                    secondary={`${personalTasks.length + companyTasks.length} tasks remaining`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Completed Tasks" 
                    secondary={`${completedTasks.length} tasks completed`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><DeleteIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Overdue Tasks" 
                    secondary={`${tasks.filter(task => getTaskStatus(task) === 'overdue').length} tasks overdue`}
                  />
                </ListItem>
                {tasks.filter(task => getTaskStatus(task) === 'due-soon').map(task => (
                  <Card key={task._id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1">{task.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Due: {format(new Date(task.deadline), 'PPp')}
                      </Typography>
                      <Chip
                        label={task.priority}
                        size="small"
                        color={getPriorityColor(task.priority)}
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Add Task Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                fullWidth
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Deadline"
                type="datetime-local"
                fullWidth
                value={newTask.deadline}
                onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newTask.type}
                  label="Type"
                  onChange={(e) => setNewTask({ ...newTask, type: e.target.value as 'personal' | 'company' })}
                >
                  <MenuItem value="personal">Personal</MenuItem>
                  <MenuItem value="company">Company</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newTask.priority}
                  label="Priority"
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Category"
                fullWidth
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddTask} variant="contained">Add Task</Button>
        </DialogActions>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={openFilter} onClose={() => setOpenFilter(false)}>
        <DialogTitle>Filter Tasks</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filterPriority}
                  label="Priority"
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterCategory}
                  label="Category"
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  {Array.from(new Set(tasks.map(task => task.category))).map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFilter(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditTaskClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          {editTask && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Title"
                  fullWidth
                  required
                  value={editTask.title}
                  onChange={e => handleEditTaskChange('title', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  value={editTask.description}
                  onChange={e => handleEditTaskChange('description', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Deadline"
                  type="datetime-local"
                  fullWidth
                  required
                  value={editTask.deadline?.slice(0, 16)}
                  onChange={e => handleEditTaskChange('deadline', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={editTask.type}
                    label="Type"
                    onChange={e => handleEditTaskChange('type', e.target.value)}
                  >
                    <MenuItem value="personal">Personal</MenuItem>
                    <MenuItem value="company">Company</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={editTask.priority}
                    label="Priority"
                    onChange={e => handleEditTaskChange('priority', e.target.value)}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Category"
                  fullWidth
                  value={editTask.category}
                  onChange={e => handleEditTaskChange('category', e.target.value)}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditTaskClose}>Cancel</Button>
          <Button onClick={handleEditTaskSave} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App; 