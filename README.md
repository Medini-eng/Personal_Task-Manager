# Task Manager Application

A modern task management application for handling both personal and company activities, with features like progress tracking, deadline notifications, and system shortcuts.

## Features

- Separate sections for personal and company tasks
- Task creation with title, description, and deadline
- Progress tracking with completion status
- Deadline notifications
- Modern, responsive UI
- Local storage for data persistence
- Keyboard shortcuts for quick actions

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd task-manager
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open in your default browser at `http://localhost:3000`.

## Usage

### Adding Tasks
1. Click the "Add New Task" button
2. Fill in the task details:
   - Title (required)
   - Description (optional)
   - Deadline (required)
   - Task Type (Personal/Company)
3. Click "Add Task" to save

### Managing Tasks
- Check/uncheck tasks to mark them as complete/incomplete
- Tasks are automatically sorted by deadline
- Use the tabs to switch between personal and company tasks
- Delete tasks using the delete icon

### Keyboard Shortcuts
- `Ctrl + N`: Add new task
- `Ctrl + Tab`: Switch between personal and company tasks
- `Space`: Toggle task completion status
- `Delete`: Delete selected task

## Technologies Used

- React
- TypeScript
- Material-UI
- date-fns
- React Hot Toast

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 