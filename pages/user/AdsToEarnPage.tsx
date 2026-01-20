import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../App';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Select from '../../components/ui/Select';
import { getAds, viewAd, getUserInfo } from '../../services/userService';
import { Ad, AdOptionType, User } from '../../types';
import { AD_VIEW_TIMER_SECONDS, AD_OPTIONS } from '../../constants';
import { motion } from 'framer-motion';

const AdsToEarnPage: React.FC = () => {
  const { user, login } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [timer, setTimer] = useState(AD_VIEW_TIMER_SECONDS);
  const [canViewNext, setCanViewNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedAdOption, setSelectedAdOption] = useState<AdOptionType>(user?.adOption || AdOptionType.OPTION_1); // Default to user's option or Option 1
  const [dailyWatchedCount, setDailyWatchedCount] = useState(user?.dailyAdsWatched || 0);
  const [dailyLimit, setDailyLimit] = useState(user?.dailyAdsLimit || AD_OPTIONS.find(opt => opt.type === selectedAdOption)?.limit || 50);

  // Changed NodeJS.Timeout to number for browser compatibility
  const timerRef = useRef<number | null>(null);

  const fetchAdsAndUserInfo = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch user info to get latest balance, watched count, and limits
      const updatedUser: User = await getUserInfo(user.id);
      login(updatedUser, false); // Update user context
      setDailyWatchedCount(updatedUser.dailyAdsWatched);
      setDailyLimit(updatedUser.dailyAdsLimit);
      setSelectedAdOption(updatedUser.adOption);

      // Fetch ads for the selected option
      const fetchedAds = await getAds(selectedAdOption);
      setAds(fetchedAds.filter(ad => ad.isActive));
      setCurrentAdIndex(0); // Reset to first ad when options/ads change
      setCanViewNext(false);
      setTimer(AD_VIEW_TIMER_SECONDS);
      setMessage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedAdOption, login]); // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchAdsAndUserInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAdsAndUserInfo]);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (!loading && ads.length > 0 && dailyWatchedCount < dailyLimit) {
      setCanViewNext(false); // Reset to false whenever ad or timer state changes
      setTimer(AD_VIEW_TIMER_SECONDS); // Reset timer
      timerRef.current = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(timerRef.current!);
            setCanViewNext(true);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    } else {
      setCanViewNext(false);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentAdIndex, loading, ads.length, dailyWatchedCount, dailyLimit]);

  const handleViewAd = async () => {
    if (!user?.id || !ads.length || !canViewNext || dailyWatchedCount >= dailyLimit) return;

    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const currentAd = ads[currentAdIndex];
      const response = await viewAd(currentAd.id, user.id);

      if (response.success) {
        // Optimistically update UI
        const updatedBalance = response.newBalance;
        const newWatchedCount = dailyWatchedCount + 1;
        login({ ...user, balance: updatedBalance, dailyAdsWatched: newWatchedCount }, false);
        setDailyWatchedCount(newWatchedCount);
        setMessage(`Ad viewed! Earned $${currentAd.earningPerView.toFixed(2)}. New Balance: $${updatedBalance.toFixed(2)}`);

        // Move to the next ad or reset
        if (currentAdIndex < ads.length - 1 && newWatchedCount < dailyLimit) {
          setCurrentAdIndex((prevIndex) => prevIndex + 1);
          setCanViewNext(false); // Reset for next ad
          setTimer(AD_VIEW_TIMER_SECONDS);
        } else {
          setMessage('Daily ad limit reached or no more ads available. Please check back tomorrow!');
          setCanViewNext(false);
        }
      } else {
        setError('Failed to record ad view.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while viewing the ad.');
    } finally {
      setLoading(false);
    }
  };

  const adOptions = AD_OPTIONS.map(opt => ({
    value: opt.type,
    label: `${opt.label} (Limit: ${opt.limit} ads/day)`
  }));

  const currentAd = ads[currentAdIndex];
  const adsAvailable = ads.length > 0;
  const limitReached = dailyWatchedCount >= dailyLimit;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-3xl font-bold text-gray-100 mb-6">Ads To Earn</h2>

      <Card>
        <div className="flex flex-col md:flex-row items-center justify-between mb-4">
          <p className="text-lg font-semibold text-gray-200 mb-2 md:mb-0">
            Current Balance: <span className="text-indigo-400">${user?.balance.toFixed(2)}</span>
          </p>
          <p className="text-lg text-gray-300">
            Ads Watched Today: <span className="text-blue-400">{dailyWatchedCount} / {dailyLimit}</span>
          </p>
        </div>
        <Select
          id="ad-option-select"
          label="Select Ad Earning Option"
          options={adOptions}
          value={selectedAdOption}
          onChange={(e) => setSelectedAdOption(e.target.value as AdOptionType)}
          disabled={loading || dailyWatchedCount > 0} // Disable if ads already watched
        />
        {dailyWatchedCount > 0 && (
            <p className="text-sm text-yellow-400 mt-2">
                You cannot change your ad earning option after viewing ads for today.
            </p>
        )}
      </Card>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {message && <Alert type="success" message={message} onClose={() => setMessage(null)} />}

      {loading ? (
        <Card className="flex items-center justify-center p-10">
          <svg className="animate-spin h-8 w-8 text-indigo-400 mr-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg text-gray-300">Loading ads...</span>
        </Card>
      ) : limitReached ? (
        <Card className="text-center p-10 bg-red-800/20 border-red-700">
          <p className="text-2xl font-bold text-red-400">Daily Ad Limit Reached!</p>
          <p className="text-gray-300 mt-4">You have watched {dailyWatchedCount} out of {dailyLimit} ads today. Please come back tomorrow for more earning opportunities!</p>
        </Card>
      ) : !adsAvailable ? (
        <Card className="text-center p-10 bg-yellow-800/20 border-yellow-700">
          <p className="text-2xl font-bold text-yellow-400">No Ads Available!</p>
          <p className="text-gray-300 mt-4">There are currently no ads to display for your selected option. Please check back later.</p>
        </Card>
      ) : (
        <Card className="relative p-0 overflow-hidden">
          <div className="relative aspect-video bg-gray-700 flex items-center justify-center">
            {currentAd && (
              <motion.img
                key={currentAd.id} // Key for re-animating on ad change
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                src={currentAd.imageUrl}
                alt={currentAd.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://picsum.photos/800/450?random=' + currentAd.id; // Fallback image
                }}
              />
            )}
            {!canViewNext && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center">
                    <p className="text-white text-4xl font-bold mb-4">
                        Watch Time Remaining: {timer}s
                    </p>
                    <p className="text-gray-300 text-lg">
                        Please wait for the timer to finish before proceeding.
                    </p>
                </div>
            )}
          </div>

          <div className="p-6">
            <h3 className="text-2xl font-bold text-indigo-400 mb-2">{currentAd?.title}</h3>
            <p className="text-gray-300 mb-4">{currentAd?.description}</p>
            <p className="text-lg font-semibold text-emerald-400 mb-6">
              Earning for this Ad: ${currentAd?.earningPerView.toFixed(2)}
            </p>

            <Button
              className="w-full py-3 text-lg"
              onClick={handleViewAd}
              disabled={!canViewNext || loading || limitReached}
              isLoading={loading}
            >
              {limitReached ? 'Daily Limit Reached' :
               (canViewNext ? 'View Ad & Earn' : `Wait ${timer}s`)}
            </Button>
            <p className="text-gray-400 text-sm mt-4 text-center">
                Ad {currentAdIndex + 1} of {ads.length} available today.
            </p>
            <p className="text-red-400 text-sm mt-2 text-center">
                Auto-click detection is active. Do not use auto-clickers.
            </p>
          </div>
        </Card>
      )}
    </motion.div>
  );
};

export default AdsToEarnPage;