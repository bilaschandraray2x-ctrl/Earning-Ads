
import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import Input from '../../components/ui/Input';
import { getFullTransactionHistory } from '../../services/adminService';
import { Transaction, TransactionType } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

const TransactionHistoryPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTransactions = await getFullTransactionHistory();
      setTransactions(fetchedTransactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction history.');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTransactions]);

  const getTransactionTypeColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.AD_EARNING:
      case TransactionType.TASK_EARNING:
        return 'text-green-400';
      case TransactionType.WITHDRAWAL_REQUEST:
        return 'text-yellow-400';
      case TransactionType.WITHDRAWAL_APPROVED:
        return 'text-blue-400';
      case TransactionType.WITHDRAWAL_REJECTED:
      case TransactionType.ADMIN_ADJUSTMENT: // Could be negative
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || tx.type === filterType;
    return matchesSearch && matchesType;
  });

  const transactionTypeOptions = [
    { value: 'all', label: 'All Types' },
    ...Object.values(TransactionType).map(type => ({ value: type, label: type.replace(/_/g, ' ') }))
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-3xl font-bold text-gray-100 mb-6">Full Transaction History</h2>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <Card>
        <h3 className="text-2xl font-bold text-red-400 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="search-transactions"
            type="text"
            placeholder="Search by description, user ID, or transaction ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            id="filter-type"
            className="shadow appearance-none border rounded w-full py-3 px-4 pr-8 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-700 border-gray-600"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            {transactionTypeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card>
        <h3 className="text-2xl font-bold text-red-400 mb-4">Transaction Log</h3>
        {loading ? (
          <div className="flex items-center justify-center p-6">
            <svg className="animate-spin h-6 w-6 text-red-400 mr-3" viewBox="0 0 24 24"></svg>
            <span className="text-gray-300">Loading transactions...</span>
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-gray-400">No transactions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded-lg">
              <thead>
                <tr className="bg-gray-600 text-gray-200 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Tx ID</th>
                  <th className="py-3 px-6 text-left">User ID</th>
                  <th className="py-3 px-6 text-left">Type</th>
                  <th className="py-3 px-6 text-left">Amount</th>
                  <th className="py-3 px-6 text-left">Description</th>
                  <th className="py-3 px-6 text-left">Timestamp</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 text-sm font-light">
                <AnimatePresence>
                  {filteredTransactions.map((tx) => (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="border-b border-gray-600 hover:bg-gray-600"
                    >
                      <td className="py-3 px-6 text-left">{tx.id.substring(0, 8)}...</td>
                      <td className="py-3 px-6 text-left">{tx.userId.substring(0, 8)}...</td>
                      <td className="py-3 px-6 text-left">
                        <span className={`font-semibold ${getTransactionTypeColor(tx.type)}`}>
                          {tx.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-left">
                        <span className={tx.amount > 0 ? 'text-green-400' : 'text-red-400'}>
                          {tx.amount > 0 ? '+' : ''}${tx.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-left">{tx.description}</td>
                      <td className="py-3 px-6 text-left">
                        {new Date(tx.timestamp).toLocaleString()}
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

export default TransactionHistoryPage;
    