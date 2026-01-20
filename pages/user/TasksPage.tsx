
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../App';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { getTasks, completeTask, getTaskHistory, getUserInfo } from '../../services/userService';
import { Task, TaskCompletion, TaskCompletionStatus, TaskStatus, User } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

const TasksPage: React.FC = () => {
  const { user, login } = useAuth();
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [taskHistory, setTaskHistory] = useState<TaskCompletion[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);

  const fetchTasksData = useCallback(async () => {
    if (!user?.id) return;
    setLoadingTasks(true);
    setError(null);
    try {
      const fetchedTasks = await getTasks(user.id);
      setAvailableTasks(fetchedTasks.filter(task => task.status === TaskStatus.PENDING)); // Only show pending tasks
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks.');
    } finally {
      setLoadingTasks(false);
    }
  }, [user?.id]); // eslint-disable-next-line react-hooks/exhaustive-deps

  const fetchTaskHistoryData = useCallback(async () => {
    if (!user?.id) return;
    setLoadingHistory(true);
    setError(null);
    try {
      const history = await getTaskHistory(user.id);
      setTaskHistory(history);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load task history.');
    } finally {
      setLoadingHistory(false);
    }
  }, [user?.id]); // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchTasksData();
    fetchTaskHistoryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTasksData, fetchTaskHistoryData]);

  const handleCompleteTask = async (task: Task) => {
    if (!user?.id) return;

    setSubmittingTaskId(task.id);
    setError(null);
    setMessage(null);
    try {
      const submissionDetails = prompt(`Please provide proof for completing "${task.title}" (e.g., screenshot link, brief description):`);
      if (!submissionDetails) {
        setSubmittingTaskId(null);
        return; // User cancelled
      }

      const response = await completeTask(task.id, user.id, submissionDetails);

      if (response.success) {
        setMessage(`Task "${task.title}" submitted for review!`);
        // Update user balance in context
        const updatedUser: User = await getUserInfo(user.id);
        login(updatedUser, false);
        // Refresh tasks and history
        fetchTasksData();
        fetchTaskHistoryData();
      } else {
        setError('Failed to submit task for review.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while submitting the task.');
    } finally {
      setSubmittingTaskId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-3xl font-bold text-gray-100 mb-6">Tasks System</h2>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {message && <Alert type="success" message={message} onClose={() => setMessage(null)} />}

      <Card>
        <h3 className="text-2xl font-bold text-indigo-400 mb-4">Available Tasks</h3>
        {loadingTasks ? (
          <div className="flex items-center justify-center p-6">
            <svg className="animate-spin h-6 w-6 text-indigo-400 mr-3" viewBox="0 0 24 24"></svg>
            <span className="text-gray-300">Loading tasks...</span>
          </div>
        ) : availableTasks.length === 0 ? (
          <p className="text-gray-400">No tasks currently available. Check back later!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {availableTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-700 p-4 rounded-lg border border-gray-600 shadow-md"
                >
                  <h4 className="text-xl font-semibold text-gray-100">{task.title}</h4>
                  <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                  <p className="text-emerald-400 font-bold mt-2">Earn: ${task.earning.toFixed(2)}</p>
                  {task.link && (
                    <a
                      href={task.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:underline text-sm mt-2 block"
                    >
                      Go to Task
                    </a>
                  )}
                  <Button
                    variant="primary"
                    className="mt-4 w-full"
                    onClick={() => handleCompleteTask(task)}
                    isLoading={submittingTaskId === task.id}
                    disabled={submittingTaskId !== null}
                  >
                    {submittingTaskId === task.id ? 'Submitting...' : 'Complete Task'}
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-2xl font-bold text-indigo-400 mb-4">Task History</h3>
        {loadingHistory ? (
          <div className="flex items-center justify-center p-6">
            <svg className="animate-spin h-6 w-6 text-indigo-400 mr-3" viewBox="0 0 24 24"></svg>
            <span className="text-gray-300">Loading history...</span>
          </div>
        ) : taskHistory.length === 0 ? (
          <p className="text-gray-400">No task history found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded-lg">
              <thead>
                <tr className="bg-gray-600 text-gray-200 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Task</th>
                  <th className="py-3 px-6 text-left">Earning</th>
                  <th className="py-3 px-6 text-left">Status</th>
                  <th className="py-3 px-6 text-left">Submitted At</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 text-sm font-light">
                {taskHistory.map((historyItem) => (
                  <tr key={historyItem.id} className="border-b border-gray-600 hover:bg-gray-600">
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      {availableTasks.find(t => t.id === historyItem.taskId)?.title || 'Unknown Task'}
                    </td>
                    <td className="py-3 px-6 text-left">${historyItem.earning.toFixed(2)}</td>
                    <td className="py-3 px-6 text-left">
                      <span
                        className={`py-1 px-3 rounded-full text-xs font-semibold ${
                          historyItem.status === TaskCompletionStatus.APPROVED ? 'bg-green-500 text-white' :
                          historyItem.status === TaskCompletionStatus.REJECTED ? 'bg-red-500 text-white' :
                          'bg-yellow-500 text-white'
                        }`}
                      >
                        {historyItem.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-left">
                      {new Date(historyItem.completedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default TasksPage;
    