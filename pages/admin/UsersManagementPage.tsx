
import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Input from '../../components/ui/Input';
import { getAllUsers, banUser, unbanUser, getUserDetailsForAdmin } from '../../services/adminService';
import { User, DeviceInfo } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

const UsersManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [userDetailsError, setUserDetailsError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUsers]);

  const handleBanUnban = async (userId: string, ban: boolean) => {
    setError(null);
    setMessage(null);
    try {
      if (ban) {
        await banUser(userId);
        setMessage('User banned successfully.');
      } else {
        await unbanUser(userId);
        setMessage('User unbanned successfully.');
      }
      fetchUsers(); // Refresh user list
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${ban ? 'ban' : 'unban'} user.`);
    }
  };

  const handleViewDetails = async (user: User) => {
    setSelectedUser(null); // Clear previous details
    setUserDetailsLoading(true);
    setUserDetailsError(null);
    try {
      const detailedUser = await getUserDetailsForAdmin(user.id);
      setSelectedUser(detailedUser);
    } catch (err) {
      setUserDetailsError(err instanceof Error ? err.message : 'Failed to fetch user details.');
    } finally {
      setUserDetailsLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.telegramId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-3xl font-bold text-gray-100 mb-6">User Management</h2>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {message && <Alert type="success" message={message} onClose={() => setMessage(null)} />}

      <Card>
        <h3 className="text-2xl font-bold text-red-400 mb-4">All Users</h3>
        <Input
          id="search-user"
          type="text"
          placeholder="Search by username, Telegram ID, or User ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />

        {loading ? (
          <div className="flex items-center justify-center p-6">
            <svg className="animate-spin h-6 w-6 text-red-400 mr-3" viewBox="0 0 24 24"></svg>
            <span className="text-gray-300">Loading users...</span>
          </div>
        ) : users.length === 0 ? (
          <p className="text-gray-400">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded-lg">
              <thead>
                <tr className="bg-gray-600 text-gray-200 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">User ID</th>
                  <th className="py-3 px-6 text-left">Telegram User</th>
                  <th className="py-3 px-6 text-left">Balance</th>
                  <th className="py-3 px-6 text-left">Status</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 text-sm font-light">
                {filteredUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="border-b border-gray-600 hover:bg-gray-600"
                  >
                    <td className="py-3 px-6 text-left">{user.id.substring(0, 8)}...</td>
                    <td className="py-3 px-6 text-left">
                      <div className="flex items-center">
                        <img
                          src={user.telegramId ? `https://i.pravatar.cc/30?u=${user.telegramId}` : 'https://i.pravatar.cc/30?u=guest'}
                          alt="Avatar"
                          className="w-8 h-8 rounded-full mr-2"
                        />
                        <span>@{user.username || 'N/A'} (ID: {user.telegramId})</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-left">${user.balance.toFixed(2)}</td>
                    <td className="py-3 px-6 text-left">
                      <span
                        className={`py-1 px-3 rounded-full text-xs font-semibold ${
                          user.isBanned ? 'bg-red-500' : 'bg-green-500'
                        } text-white`}
                      >
                        {user.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex item-center justify-center space-x-2">
                        <Button
                          variant="secondary"
                          onClick={() => handleViewDetails(user)}
                          className="px-3 py-1 text-xs"
                        >
                          Details
                        </Button>
                        <Button
                          variant={user.isBanned ? 'primary' : 'danger'}
                          onClick={() => handleBanUnban(user.id, !user.isBanned)}
                          className="px-3 py-1 text-xs"
                        >
                          {user.isBanned ? 'Unban' : 'Ban'}
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
          >
            <Card className="max-w-xl w-full relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                onClick={() => setSelectedUser(null)}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-2xl font-bold text-red-400 mb-4">User Details: @{selectedUser.username}</h3>

              {userDetailsLoading ? (
                <div className="flex items-center justify-center p-6">
                  <svg className="animate-spin h-6 w-6 text-red-400 mr-3" viewBox="0 0 24 24"></svg>
                  <span className="text-gray-300">Loading user details...</span>
                </div>
              ) : userDetailsError ? (
                <Alert type="error" message={userDetailsError} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                  <div>
                    <p><span className="font-semibold text-gray-200">User ID:</span> {selectedUser.id}</p>
                    <p><span className="font-semibold text-gray-200">Telegram ID:</span> {selectedUser.telegramId}</p>
                    <p><span className="font-semibold text-gray-200">Username:</span> @{selectedUser.username}</p>
                    <p><span className="font-semibold text-gray-200">Balance:</span> ${selectedUser.balance.toFixed(2)}</p>
                    <p><span className="font-semibold text-gray-200">Daily Ads Watched:</span> {selectedUser.dailyAdsWatched}</p>
                    <p><span className="font-semibold text-gray-200">Daily Ads Limit:</span> {selectedUser.dailyAdsLimit}</p>
                    <p><span className="font-semibold text-gray-200">Ad Option:</span> {selectedUser.adOption}</p>
                    <p><span className="font-semibold text-gray-200">Banned:</span> <span className={selectedUser.isBanned ? 'text-red-400' : 'text-green-400'}>{selectedUser.isBanned ? 'Yes' : 'No'}</span></p>
                    <p><span className="font-semibold text-gray-200">Created At:</span> {new Date(selectedUser.createdAt).toLocaleString()}</p>
                  </div>
                  {selectedUser.deviceInfo && (
                    <div>
                      <p className="font-semibold text-gray-200 mt-4 md:mt-0">Device Information:</p>
                      <p><span className="font-semibold text-gray-300">IP:</span> {selectedUser.deviceInfo.ipAddress}</p>
                      <p><span className="font-semibold text-gray-300">Browser:</span> {selectedUser.deviceInfo.browser}</p>
                      <p><span className="font-semibold text-gray-300">OS:</span> {selectedUser.deviceInfo.os}</p>
                      <p><span className="font-semibold text-gray-300">Fingerprint:</span> <span className="text-xs break-all">{selectedUser.deviceInfo.deviceFingerprint}</span></p>
                      <p><span className="font-semibold text-gray-300">VPN Detected:</span> <span className={selectedUser.deviceInfo.vpnDetected ? 'text-red-400' : 'text-green-400'}>{selectedUser.deviceInfo.vpnDetected ? 'Yes' : 'No'}</span></p>
                      <p><span className="font-semibold text-gray-300">Proxy Detected:</span> <span className={selectedUser.deviceInfo.proxyDetected ? 'text-red-400' : 'text-green-400'}>{selectedUser.deviceInfo.proxyDetected ? 'Yes' : 'No'}</span></p>
                      <p><span className="font-semibold text-gray-300">Emulator Detected:</span> <span className={selectedUser.deviceInfo.emulatorDetected ? 'text-red-400' : 'text-green-400'}>{selectedUser.deviceInfo.emulatorDetected ? 'Yes' : 'No'}</span></p>
                      <p><span className="font-semibold text-gray-300">Multiple Accounts:</span> <span className={selectedUser.deviceInfo.multipleAccountsDetected ? 'text-red-400' : 'text-green-400'}>{selectedUser.deviceInfo.multipleAccountsDetected ? 'Detected' : 'None'}</span></p>
                      <p><span className="font-semibold text-gray-300">Last Login:</span> {new Date(selectedUser.deviceInfo.lastLoginAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UsersManagementPage;
    