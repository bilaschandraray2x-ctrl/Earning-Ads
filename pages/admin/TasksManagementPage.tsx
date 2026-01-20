import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import { getAllTasks, addTask, updateTask, deleteTask } from '../../services/adminService';
import { Task, TaskStatus } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

const TasksManagementPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Task Form State
  const [taskForm, setTaskForm] = useState<Omit<Task, 'id' | 'createdAt' | 'status'> & {id?: string}>({
    title: '',
    description: '',
    earning: 0,
    link: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTasks = await getAllTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTasks]);

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      earning: 0,
      link: '',
    });
    setIsEditing(false);
  };

  const handleTaskFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setTaskForm((prev) => ({
      ...prev,
      [id]: id === 'earning' ? parseFloat(value) : value,
    }));
  };

  const handleTaskFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (isEditing && taskForm.id) {
        await updateTask(taskForm.id, taskForm);
        setMessage('Task updated successfully!');
      } else {
        // Corrected: Removed `status: TaskStatus.PENDING` as addTask expects status to be omitted
        await addTask(taskForm); 
        setMessage('Task added successfully!');
      }
      resetTaskForm();
      fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'add'} task.`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditTask = (task: Task) => {
    setTaskForm({ ...task });
    setIsEditing(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setError(null);
    setMessage(null);
    try {
      await deleteTask(taskId);
      setMessage('Task deleted successfully!');
      fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-3xl font-bold text-gray-100 mb-6">Tasks Management</h2>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {message && <Alert type="success" message={message} onClose={() => setMessage(null)} />}

      <Card>
        <h3 className="text-2xl font-bold text-red-400 mb-4">{isEditing ? 'Edit Task' : 'Add New Task'}</h3>
        <form onSubmit={handleTaskFormSubmit} className="space-y-4">
          <Input
            id="title"
            label="Task Title"
            type="text"
            value={taskForm.title}
            onChange={handleTaskFormChange}
            required
            disabled={formLoading}
          />
          <Input
            id="description"
            label="Task Description"
            type="text"
            value={taskForm.description}
            onChange={handleTaskFormChange}
            required
            disabled={formLoading}
          />
          <Input
            id="earning"
            label="Earning for Completion"
            type="number"
            value={taskForm.earning}
            onChange={handleTaskFormChange}
            step="0.01"
            min="0"
            required
            disabled={formLoading}
          />
          <Input
            id="link"
            label="External Link (Optional)"
            type="text"
            value={taskForm.link}
            onChange={handleTaskFormChange}
            placeholder="e.g., https://example.com/task-details"
            disabled={formLoading}
          />
          <div className="flex space-x-2 mt-6">
            <Button type="submit" className="flex-1" isLoading={formLoading} disabled={formLoading}>
              {isEditing ? 'Update Task' : 'Add Task'}
            </Button>
            {isEditing && (
              <Button type="button" variant="secondary" onClick={resetTaskForm} disabled={formLoading}>
                Cancel Edit
              </Button>
            )}
          </div>
        </form>
      </Card>

      <Card>
        <h3 className="text-2xl font-bold text-red-400 mb-4">Existing Tasks</h3>
        {loading ? (
          <div className="flex items-center justify-center p-6">
            <svg className="animate-spin h-6 w-6 text-red-400 mr-3" viewBox="0 0 24 24"></svg>
            <span className="text-gray-300">Loading tasks...</span>
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-gray-400">No tasks created yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded-lg">
              <thead>
                <tr className="bg-gray-600 text-gray-200 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Title</th>
                  <th className="py-3 px-6 text-left">Earning</th>
                  <th className="py-3 px-6 text-left">Link</th>
                  <th className="py-3 px-6 text-left">Status</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 text-sm font-light">
                <AnimatePresence>
                  {tasks.map((task) => (
                    <motion.tr
                      key={task.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className="border-b border-gray-600 hover:bg-gray-600"
                    >
                      <td className="py-3 px-6 text-left">{task.title}</td>
                      <td className="py-3 px-6 text-left">${task.earning.toFixed(2)}</td>
                      <td className="py-3 px-6 text-left">
                        {task.link ? <a href={task.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Link</a> : 'N/A'}
                      </td>
                      <td className="py-3 px-6 text-left">
                         <span
                          className={`py-1 px-3 rounded-full text-xs font-semibold ${
                            task.status === TaskStatus.PENDING ? 'bg-yellow-500' :
                            task.status === TaskStatus.APPROVED ? 'bg-green-500' :
                            'bg-gray-500'
                          } text-white`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex item-center justify-center space-x-2">
                          <Button variant="secondary" onClick={() => handleEditTask(task)} className="px-3 py-1 text-xs">
                            Edit
                          </Button>
                          <Button variant="danger" onClick={() => handleDeleteTask(task.id)} className="px-3 py-1 text-xs">
                            Delete
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default TasksManagementPage;