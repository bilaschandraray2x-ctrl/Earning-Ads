
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../App';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Alert from '../../components/ui/Alert';
import { requestWithdrawal, getWithdrawalHistory, getUserInfo } from '../../services/userService';
import { Withdrawal, WithdrawalMethod, WithdrawalStatus, User } from '../../types';
import { WITHDRAWAL_METHODS, MIN_WITHDRAWAL_LIMIT_DEFAULT } from '../../constants';
import { motion, AnimatePresence } from 'framer-motion';

const WithdrawalPage: React.FC = () => {
  const { user, login } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<WithdrawalMethod>(WITHDRAWAL_METHODS[0]);
  const [details, setDetails] = useState<string>('');
  const [withdrawalHistory, setWithdrawalHistory] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [minWithdrawalLimit, setMinWithdrawalLimit] = useState(MIN_WITHDRAWAL_LIMIT_DEFAULT);

  const fetchWithdrawalData = useCallback(async () => {
    if (!user?.id) return;
    setLoadingHistory(true);
    setError(null);
    try {
      const history = await getWithdrawalHistory(user.id);
      setWithdrawalHistory(history);
      // In a real app, minWithdrawalLimit would be fetched from admin settings
      // setMinWithdrawalLimit(fetchedSettings.minWithdrawal);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load withdrawal history.');
    } finally {
      setLoadingHistory(false);
    }
  }, [user?.id]); // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchWithdrawalData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchWithdrawalData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setError('User not logged in.');
      return;
    }

    const withdrawalAmount = parseFloat(amount);

    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    if (withdrawalAmount < minWithdrawalLimit) {
      setError(`Minimum withdrawal amount is $${minWithdrawalLimit.toFixed(2)}.`);
      return;
    }
    if (withdrawalAmount > user.balance) {
      setError('Insufficient balance.');
      return;
    }
    if (!details.trim()) {
      setError('Please provide withdrawal details (e.g., account number, address).');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await requestWithdrawal(user.id, withdrawalAmount, method, details);
      if (response.success) {
        setMessage(`Withdrawal request for $${withdrawalAmount.toFixed(2)} submitted successfully!`);
        setAmount('');
        setDetails('');
        // Update user balance in context
        const updatedUser: User = await getUserInfo(user.id);
        login(updatedUser, false);
        fetchWithdrawalData(); // Refresh history
      } else {
        setError('Failed to submit withdrawal request.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while submitting withdrawal.');
    } finally {
      setLoading(false);
    }
  };

  const withdrawalOptions = WITHDRAWAL_METHODS.map((m) => ({ value: m, label: m }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-3xl font-bold text-gray-100 mb-6">Withdrawal System</h2>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {message && <Alert type="success" message={message} onClose={() => setMessage(null)} />}

      <Card>
        <h3 className="text-2xl font-bold text-indigo-400 mb-4">Request Withdrawal</h3>
        <p className="text-lg font-semibold text-gray-200 mb-4">
          Current Balance: <span className="text-emerald-400">${user?.balance.toFixed(2)}</span>
        </p>
        <p className="text-md text-gray-400 mb-6">
          Minimum withdrawal limit: <span className="font-semibold text-blue-400">${minWithdrawalLimit.toFixed(2)}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="amount"
            label="Amount to Withdraw"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Minimum $${minWithdrawalLimit.toFixed(2)}`}
            step="0.01"
            min={minWithdrawalLimit}
            required
            disabled={loading}
          />
          <Select
            id="method"
            label="Withdrawal Method"
            options={withdrawalOptions}
            value={method}
            onChange={(e) => setMethod(e.target.value as WithdrawalMethod)}
            required
            disabled={loading}
          />
          <Input
            id="details"
            label="Withdrawal Details (Account No, Address, Email etc.)"
            type="text"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="e.g., Bkash: 01xxxxxxxxx, Binance: your_email@example.com"
            required
            disabled={loading}
          />
          <Button type="submit" className="w-full mt-6" isLoading={loading} disabled={loading}>
            Request Withdrawal
          </Button>
        </form>
        <p className="text-sm text-gray-500 mt-4 text-center">
            All withdrawal requests require admin approval and may take up to 24-48 hours.
        </p>
      </Card>

      <Card>
        <h3 className="text-2xl font-bold text-indigo-400 mb-4">Withdrawal History</h3>
        {loadingHistory ? (
          <div className="flex items-center justify-center p-6">
            <svg className="animate-spin h-6 w-6 text-indigo-400 mr-3" viewBox="0 0 24 24"></svg>
            <span className="text-gray-300">Loading history...</span>
          </div>
        ) : withdrawalHistory.length === 0 ? (
          <p className="text-gray-400">No withdrawal requests found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded-lg">
              <thead>
                <tr className="bg-gray-600 text-gray-200 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Amount</th>
                  <th className="py-3 px-6 text-left">Method</th>
                  <th className="py-3 px-6 text-left">Details</th>
                  <th className="py-3 px-6 text-left">Status</th>
                  <th className="py-3 px-6 text-left">Requested At</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 text-sm font-light">
                {withdrawalHistory.map((item) => (
                  <tr key={item.id} className="border-b border-gray-600 hover:bg-gray-600">
                    <td className="py-3 px-6 text-left">${item.amount.toFixed(2)}</td>
                    <td className="py-3 px-6 text-left">{item.method}</td>
                    <td className="py-3 px-6 text-left break-all">{item.details}</td>
                    <td className="py-3 px-6 text-left">
                      <span
                        className={`py-1 px-3 rounded-full text-xs font-semibold ${
                          item.status === WithdrawalStatus.APPROVED ? 'bg-green-500 text-white' :
                          item.status === WithdrawalStatus.REJECTED ? 'bg-red-500 text-white' :
                          'bg-yellow-500 text-white'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-left">
                      {new Date(item.requestedAt).toLocaleString()}
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

export default WithdrawalPage;
    