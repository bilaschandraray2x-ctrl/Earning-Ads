
import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Alert from '../../components/ui/Alert';
import {
  getAllAds,
  addAd,
  updateAd,
  deleteAd,
  getPlatformSettings,
  updatePlatformSettings
} from '../../services/adminService';
import { Ad, AdOptionType } from '../../types';
import { AD_OPTIONS } from '../../constants';
import { motion, AnimatePresence } from 'framer-motion';

const AdsManagementPage: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Ad Form State
  const [adForm, setAdForm] = useState<Omit<Ad, 'id' | 'createdAt' | 'isActive'> & {id?: string}>({
    title: '',
    description: '',
    imageUrl: '',
    adLink: '',
    earningPerView: 0.01,
    type: AdOptionType.OPTION_1,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Platform Settings State
  const [settings, setSettings] = useState({
    earningPerAd1: 0,
    earningPerAd2: 0,
    dailyLimit1: 0,
    dailyLimit2: 0,
    minWithdrawal: 0,
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsFormLoading, setSettingsFormLoading] = useState(false);

  const fetchAdsAndSettings = useCallback(async () => {
    setLoading(true);
    setSettingsLoading(true);
    setError(null);
    try {
      const fetchedAds = await getAllAds();
      setAds(fetchedAds);

      const fetchedSettings = await getPlatformSettings();
      setSettings(fetchedSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data.');
    } finally {
      setLoading(false);
      setSettingsLoading(false);
    }
  }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchAdsAndSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAdsAndSettings]);

  const resetAdForm = () => {
    setAdForm({
      title: '',
      description: '',
      imageUrl: '',
      adLink: '',
      earningPerView: 0.01,
      type: AdOptionType.OPTION_1,
    });
    setIsEditing(false);
  };

  const handleAdFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setAdForm((prev) => ({
      ...prev,
      [id]: id === 'earningPerView' ? parseFloat(value) : value,
    }));
  };

  const handleAdFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (isEditing && adForm.id) {
        await updateAd(adForm.id, adForm);
        setMessage('Ad updated successfully!');
      } else {
        await addAd(adForm);
        setMessage('Ad added successfully!');
      }
      resetAdForm();
      fetchAdsAndSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'add'} ad.`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditAd = (ad: Ad) => {
    setAdForm({ ...ad });
    setIsEditing(true);
  };

  const handleDeleteAd = async (adId: string) => {
    if (!window.confirm('Are you sure you want to delete this ad?')) return;
    setError(null);
    setMessage(null);
    try {
      await deleteAd(adId);
      setMessage('Ad deleted successfully!');
      fetchAdsAndSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete ad.');
    }
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [id]: parseFloat(value),
    }));
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsFormLoading(true);
    setError(null);
    setMessage(null);
    try {
      await updatePlatformSettings(settings);
      setMessage('Platform settings updated successfully!');
      fetchAdsAndSettings(); // Refresh settings
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update platform settings.');
    } finally {
      setSettingsFormLoading(false);
    }
  };

  const adTypeOptions = AD_OPTIONS.map((opt) => ({
    value: opt.type,
    label: `${opt.label} (Limit: ${opt.limit})`,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-3xl font-bold text-gray-100 mb-6">Ads Management</h2>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {message && <Alert type="success" message={message} onClose={() => setMessage(null)} />}

      <Card>
        <h3 className="text-2xl font-bold text-red-400 mb-4">Platform Settings</h3>
        {settingsLoading ? (
          <div className="flex items-center justify-center p-6">
            <svg className="animate-spin h-6 w-6 text-red-400 mr-3" viewBox="0 0 24 24"></svg>
            <span className="text-gray-300">Loading settings...</span>
          </div>
        ) : (
          <form onSubmit={handleSettingsSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="earningPerAd1"
              label="Earning per Ad (Option 1)"
              type="number"
              value={settings.earningPerAd1}
              onChange={handleSettingsChange}
              step="0.001"
              min="0"
              required
              disabled={settingsFormLoading}
            />
            <Input
              id="dailyLimit1"
              label="Daily Limit (Option 1)"
              type="number"
              value={settings.dailyLimit1}
              onChange={handleSettingsChange}
              min="0"
              required
              disabled={settingsFormLoading}
            />
            <Input
              id="earningPerAd2"
              label="Earning per Ad (Option 2)"
              type="number"
              value={settings.earningPerAd2}
              onChange={handleSettingsChange}
              step="0.001"
              min="0"
              required
              disabled={settingsFormLoading}
            />
            <Input
              id="dailyLimit2"
              label="Daily Limit (Option 2)"
              type="number"
              value={settings.dailyLimit2}
              onChange={handleSettingsChange}
              min="0"
              required
              disabled={settingsFormLoading}
            />
            <Input
              id="minWithdrawal"
              label="Minimum Withdrawal Limit"
              type="number"
              value={settings.minWithdrawal}
              onChange={handleSettingsChange}
              step="0.01"
              min="0"
              required
              disabled={settingsFormLoading}
              className="col-span-full md:col-span-1"
            />
            <Button type="submit" className="col-span-full mt-4" isLoading={settingsFormLoading} disabled={settingsFormLoading}>
              Update Settings
            </Button>
          </form>
        )}
      </Card>

      <Card>
        <h3 className="text-2xl font-bold text-red-400 mb-4">{isEditing ? 'Edit Ad' : 'Add New Ad'}</h3>
        <form onSubmit={handleAdFormSubmit} className="space-y-4">
          <Input
            id="title"
            label="Ad Title"
            type="text"
            value={adForm.title}
            onChange={handleAdFormChange}
            required
            disabled={formLoading}
          />
          <Input
            id="description"
            label="Ad Description"
            type="text"
            value={adForm.description}
            onChange={handleAdFormChange}
            required
            disabled={formLoading}
          />
          <Input
            id="imageUrl"
            label="Image URL"
            type="text"
            value={adForm.imageUrl}
            onChange={handleAdFormChange}
            placeholder="e.g., https://picsum.photos/800/450"
            required
            disabled={formLoading}
          />
          <Input
            id="adLink"
            label="Ad Link"
            type="text"
            value={adForm.adLink}
            onChange={handleAdFormChange}
            required
            disabled={formLoading}
          />
          <Input
            id="earningPerView"
            label="Earning per View"
            type="number"
            value={adForm.earningPerView}
            onChange={handleAdFormChange}
            step="0.001"
            min="0"
            required
            disabled={formLoading}
          />
          <Select
            id="type"
            label="Ad Option Type"
            options={adTypeOptions}
            value={adForm.type}
            onChange={handleAdFormChange}
            required
            disabled={formLoading}
          />
          <div className="flex space-x-2 mt-6">
            <Button type="submit" className="flex-1" isLoading={formLoading} disabled={formLoading}>
              {isEditing ? 'Update Ad' : 'Add Ad'}
            </Button>
            {isEditing && (
              <Button type="button" variant="secondary" onClick={resetAdForm} disabled={formLoading}>
                Cancel Edit
              </Button>
            )}
          </div>
        </form>
      </Card>

      <Card>
        <h3 className="text-2xl font-bold text-red-400 mb-4">Existing Ads</h3>
        {loading ? (
          <div className="flex items-center justify-center p-6">
            <svg className="animate-spin h-6 w-6 text-red-400 mr-3" viewBox="0 0 24 24"></svg>
            <span className="text-gray-300">Loading ads...</span>
          </div>
        ) : ads.length === 0 ? (
          <p className="text-gray-400">No ads created yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded-lg">
              <thead>
                <tr className="bg-gray-600 text-gray-200 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Title</th>
                  <th className="py-3 px-6 text-left">Type</th>
                  <th className="py-3 px-6 text-left">Earning</th>
                  <th className="py-3 px-6 text-left">Link</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 text-sm font-light">
                <AnimatePresence>
                  {ads.map((ad) => (
                    <motion.tr
                      key={ad.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className="border-b border-gray-600 hover:bg-gray-600"
                    >
                      <td className="py-3 px-6 text-left">{ad.title}</td>
                      <td className="py-3 px-6 text-left">{ad.type}</td>
                      <td className="py-3 px-6 text-left">${ad.earningPerView.toFixed(2)}</td>
                      <td className="py-3 px-6 text-left">
                        <a href={ad.adLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Link</a>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex item-center justify-center space-x-2">
                          <Button variant="secondary" onClick={() => handleEditAd(ad)} className="px-3 py-1 text-xs">
                            Edit
                          </Button>
                          <Button variant="danger" onClick={() => handleDeleteAd(ad.id)} className="px-3 py-1 text-xs">
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

export default AdsManagementPage;
    