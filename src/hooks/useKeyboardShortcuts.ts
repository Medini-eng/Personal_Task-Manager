import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onAddTask: () => void;
  onSwitchTab: () => void;
  onToggleTaskStatus: () => void;
  onDeleteTask: () => void;
}

export const useKeyboardShortcuts = ({
  onAddTask,
  onSwitchTab,
  onToggleTaskStatus,
  onDeleteTask,
}: KeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl + N: Add new task
      if (event.ctrlKey && event.key === 'n') {
        event.preventDefault();
        onAddTask();
      }
      // Ctrl + Tab: Switch between personal and company tasks
      else if (event.ctrlKey && event.key === 'Tab') {
        event.preventDefault();
        onSwitchTab();
      }
      // Space: Toggle task completion status
      else if (event.key === ' ') {
        event.preventDefault();
        onToggleTaskStatus();
      }
      // Delete: Delete selected task
      else if (event.key === 'Delete') {
        event.preventDefault();
        onDeleteTask();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onAddTask, onSwitchTab, onToggleTaskStatus, onDeleteTask]);
}; 