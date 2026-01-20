
import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { getPendingWithdrawals, approveWithdrawal, rejectWithdrawal } from '../../services/adminService';
import { Withdrawal, WithdrawalStatus } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

const WithdrawalsReviewPage: React.FC = () => {
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchPendingWithdrawals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedWithdrawals = await getPendingWithdrawals();
      setPendingWithdrawals(fetchedWithdrawals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pending withdrawals.');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchPendingWithdrawals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPendingWithdrawals]);

  const handleApprove = async (withdrawalId: string) => {
    setActionLoadingId(withdrawalId);
    setError(null);
    setMessage(null);
    try {
      await approveWithdrawal(withdrawalId);
      setMessage(`Withdrawal ${withdrawalId.substring(0, 8)}... approved successfully.`);
      fetchPendingWithdrawals(); // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve withdrawal.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (withdrawalId: string) => {
    const reason = prompt('Please provide a reason for rejecting this withdrawal:');
    if (!reason) return;

    setActionLoadingId(withdrawalId);
    setError(null);
    setMessage(null);
    try {
      await rejectWithdrawal(withdrawalId, reason);
      setMessage(`Withdrawal ${withdrawalId.substring(0, 8)}... rejected successfully. Reason: ${reason}`);
      fetchPendingWithdrawals(); // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject withdrawal.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-3xl font-bold text-gray-100 mb-6">Withdrawal Review</h2>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {message && <Alert type="success" message={message} onClose={() => setMessage(null)} />}

      <Card>
        <h3 className="text-2xl font-bold text-red-400 mb-4">Pending Withdrawals</h3>
        {loading ? (
          <div className="flex items-center justify-center p-6">
            <svg className="animate-spin h-6 w-6 text-red-400 mr-3" viewBox="0 0 24 24"></svg>
            <span className="text-gray-300">Loading pending withdrawals...</span>
          </div>
        ) : pendingWithdrawals.length === 0 ? (
          <p className="text-gray-400">No pending withdrawals to review.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded-lg">
              <thead>
                <tr className="bg-gray-600 text-gray-200 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Req ID</th>
                  <th className="py-3 px-6 text-left">User ID</th>
                  <th className="py-3 px-6 text-left">Amount</th>
                  <th className="py-3 px-6 text-left">Method</th>
                  <th className="py-3 px-6 text-left">Details</th>
                  <th className="py-3 px-6 text-left">Requested At</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 text-sm font-light">
                <AnimatePresence>
                  {pendingWithdrawals.map((withdrawal) => (
                    <motion.tr
                      key={withdrawal.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className="border-b border-gray-600 hover:bg-gray-600"
                    >
                      <td className="py-3 px-6 text-left">{withdrawal.id.substring(0, 8)}...</td>
                      <td className="py-3 px-6 text-left">{withdrawal.userId.substring(0, 8)}...</td>
                      <td className="py-3 px-6 text-left">${withdrawal.amount.toFixed(2)}</td>
                      <td className="py-3 px-6 text-left">{withdrawal.method}</td>
                      <td className="py-3 px-6 text-left break-all">{withdrawal.details}</td>
                      <td className="py-3 px-6 text-left">
                        {new Date(withdrawal.requestedAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex item-center justify-center space-x-2">
                          <Button
                            variant="primary"
                            onClick={() => handleApprove(withdrawal.id)}
                            isLoading={actionLoadingId === withdrawal.id}
                            disabled={actionLoadingId !== null}
                            className="px-3 py-1 text-xs"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleReject(withdrawal.id)}
                            isLoading={actionLoadingId === withdrawal.id}
                            disabled={actionLoadingId !== null}
                            className="px-3 py-1 text-xs"
                          >
                            Reject
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

export default WithdrawalsReviewPage;
    