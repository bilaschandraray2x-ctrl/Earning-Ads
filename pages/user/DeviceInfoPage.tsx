
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../App';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import { getDeviceInfo } from '../../services/userService';
import { DeviceInfo, SecurityStatus } from '../../types';
import { motion } from 'framer-motion';

// Mock fingerprinting library (for demo purposes)
// In a real application, you would integrate a dedicated library like FingerprintJS Pro
// or generate this on the backend after sending client-side signals.
const getClientSideFingerprint = (): string => {
  const navigator_platform = navigator.platform || '';
  const navigator_vendor = navigator.vendor || '';
  const screen_width = window.screen.width;
  const screen_height = window.screen.height;
  const color_depth = window.screen.colorDepth;
  const pixel_ratio = window.devicePixelRatio;
  const timezone_offset = new Date().getTimezoneOffset();
  const plugins = Array.from(navigator.plugins).map(p => p.name).join(',');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Client Fingerprint Demo', 2, 15);
  }
  const canvas_data = canvas.toDataURL();

  const fingerprint_components = [
    navigator_platform,
    navigator_vendor,
    screen_width,
    screen_height,
    color_depth,
    pixel_ratio,
    timezone_offset,
    plugins,
    canvas_data,
  ];
  return btoa(fingerprint_components.join('|')).substring(0, 64); // Simple hash for demo
};

const DeviceInfoPage: React.FC = () => {
  const { user } = useAuth();
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeviceInfo = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      // In a real app, client-side signals would be sent to the backend
      // and the backend would return a more comprehensive DeviceInfo and SecurityStatus.
      // For this frontend demo, we'll combine client-side derived info with mock API response.

      // Simulate client-side data collection (for illustrative purposes only)
      const clientFingerprint = getClientSideFingerprint();
      const clientBrowser = navigator.userAgent;
      const clientOS = navigator.platform;
      const clientIP = 'Fetching...'; // Placeholder, actual IP must come from backend

      // Mock backend response for demonstration of a secure system
      const backendDeviceInfo: DeviceInfo = await getDeviceInfo(user.id);

      setDeviceInfo({
        ...backendDeviceInfo, // Merge with any backend-derived info (like IP, VPN detection)
        browser: backendDeviceInfo.browser || clientBrowser,
        os: backendDeviceInfo.os || clientOS,
        deviceFingerprint: backendDeviceInfo.deviceFingerprint || clientFingerprint, // Backend should store and verify this
      });

      // Mock security status based on backend data (simplified for demo)
      const currentSecurityStatus: SecurityStatus = {
        status: backendDeviceInfo.multipleAccountsDetected || backendDeviceInfo.vpnDetected || backendDeviceInfo.proxyDetected || backendDeviceInfo.emulatorDetected ? 'Warning' : 'Safe',
        reasons: [],
      };

      if (backendDeviceInfo.multipleAccountsDetected) currentSecurityStatus.reasons.push('Multiple accounts detected from this device.');
      if (backendDeviceInfo.vpnDetected) currentSecurityStatus.reasons.push('VPN usage detected.');
      if (backendDeviceInfo.proxyDetected) currentSecurityStatus.reasons.push('Proxy usage detected.');
      if (backendDeviceInfo.emulatorDetected) currentSecurityStatus.reasons.push('Emulator usage detected.');
      if (currentSecurityStatus.reasons.length === 0) currentSecurityStatus.reasons.push('Your account security is good.');

      if (user.isBanned) {
        currentSecurityStatus.status = 'Blocked';
        currentSecurityStatus.reasons.push('Your account is currently banned.');
      }

      setSecurityStatus(currentSecurityStatus);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load device information.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.isBanned]); // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchDeviceInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchDeviceInfo]);

  const getStatusColor = (status: SecurityStatus['status']) => {
    switch (status) {
      case 'Safe': return 'text-green-400';
      case 'Warning': return 'text-yellow-400';
      case 'Blocked': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-3xl font-bold text-gray-100 mb-6">Device Information</h2>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {loading ? (
        <Card className="flex items-center justify-center p-10">
          <svg className="animate-spin h-8 w-8 text-indigo-400 mr-3" viewBox="0 0 24 24"></svg>
          <span className="text-lg text-gray-300">Loading device data...</span>
        </Card>
      ) : (
        <>
          <Card>
            <h3 className="text-2xl font-bold text-indigo-400 mb-4">Account Security Status</h3>
            {securityStatus && (
              <>
                <p className="text-lg mb-2">
                  Status: <span className={`${getStatusColor(securityStatus.status)} font-semibold`}>{securityStatus.status}</span>
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  {securityStatus.reasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
                <p className="text-sm text-gray-500 mt-4">
                  Note: Security checks are performed server-side for accuracy and fraud prevention.
                  Detected issues may lead to account restrictions.
                </p>
              </>
            )}
          </Card>

          <Card>
            <h3 className="text-2xl font-bold text-indigo-400 mb-4">Your Device Details</h3>
            {deviceInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                <div>
                  <p><span className="font-semibold text-gray-200">IP Address:</span> {deviceInfo.ipAddress}</p>
                  <p><span className="font-semibold text-gray-200">Browser:</span> {deviceInfo.browser}</p>
                  <p><span className="font-semibold text-gray-200">Operating System:</span> {deviceInfo.os}</p>
                  <p><span className="font-semibold text-gray-200">Device Fingerprint:</span> <span className="text-sm break-all">{deviceInfo.deviceFingerprint || 'Not available'}</span></p>
                </div>
                <div>
                  <p><span className="font-semibold text-gray-200">VPN Detected:</span> <span className={deviceInfo.vpnDetected ? 'text-red-400' : 'text-green-400'}>{deviceInfo.vpnDetected ? 'Yes' : 'No'}</span></p>
                  <p><span className="font-semibold text-gray-200">Proxy Detected:</span> <span className={deviceInfo.proxyDetected ? 'text-red-400' : 'text-green-400'}>{deviceInfo.proxyDetected ? 'Yes' : 'No'}</span></p>
                  <p><span className="font-semibold text-gray-200">Emulator Detected:</span> <span className={deviceInfo.emulatorDetected ? 'text-red-400' : 'text-green-400'}>{deviceInfo.emulatorDetected ? 'Yes' : 'No'}</span></p>
                  <p><span className="font-semibold text-gray-200">Multiple Accounts:</span> <span className={deviceInfo.multipleAccountsDetected ? 'text-red-400' : 'text-green-400'}>{deviceInfo.multipleAccountsDetected ? 'Detected' : 'None'}</span></p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">Device information could not be loaded.</p>
            )}
            <p className="text-sm text-gray-500 mt-4">
              Your device information is used for security purposes to prevent fraudulent activities and multiple accounts.
            </p>
          </Card>
        </>
      )}
    </motion.div>
  );
};

export default DeviceInfoPage;
    