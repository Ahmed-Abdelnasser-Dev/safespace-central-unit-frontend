import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { API_URL } from '@/lib/apiConfig';

function SystemTestPage() {
  const [backendStatus, setBackendStatus] = useState({
    connected: false,
    loading: true,
    message: 'Checking connection...',
    environment: '',
    version: '',
    serverTime: '',
    uptime: 0,
  });

  const [testResults, setTestResults] = useState({
    healthCheck: '⏳ Pending',
    apiTest: '⏳ Pending',
  });

  const testBackendConnection = async () => {
    setBackendStatus((prev) => ({ ...prev, loading: true }));
    setTestResults({ healthCheck: '⏳ Testing...', apiTest: '⏳ Testing...' });

    try {
      const healthRes = await fetch(`${API_URL}/health`);
      const healthData = await healthRes.json();
      if (healthData.status === 'success') {
        setTestResults((prev) => ({ ...prev, healthCheck: '✅ Passed' }));
        setBackendStatus({
          connected: true,
          loading: false,
          message: healthData.message,
          environment: healthData.environment,
          version: healthData.version,
          serverTime: healthData.timestamp,
          uptime: 0,
        });
      }
    } catch (err) {
      console.error('Health check failed:', err);
      setTestResults((prev) => ({ ...prev, healthCheck: '❌ Failed' }));
      setBackendStatus({
        connected: false,
        loading: false,
        message: 'Backend is offline',
        environment: '',
        version: '',
        serverTime: '',
        uptime: 0,
      });
      return;
    }

    try {
      const testRes = await fetch(`${API_URL}/test-frontend`);
      const testData = await testRes.json();
      if (testData.status === 'success') {
        setTestResults((prev) => ({ ...prev, apiTest: '✅ Passed' }));
        setBackendStatus((prev) => ({
          ...prev,
          serverTime: testData.data.serverTime,
          uptime: Math.floor(testData.data.uptime),
        }));
      }
    } catch (err) {
      console.error('API test failed:', err);
      setTestResults((prev) => ({ ...prev, apiTest: '❌ Failed' }));
    }
  };

  // Run test on mount
  useState(() => { testBackendConnection(); });

  return (
    <div className="min-h-full bg-safe-dark text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-safe-gray-light/40 backdrop-blur-sm rounded-xl p-8 mb-8 border border-safe-gray-light shadow-card">
          <h2 className="text-2xl font-semibold mb-2 text-safe-blue">System Test Dashboard</h2>
          <p className="text-gray-400 mb-8">Testing connection between Frontend (React + Vite) and Backend (Node.js + Express)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-safe-gray/60 rounded-lg p-6 border border-safe-gray-light">
              <h3 className="text-sm font-semibold mb-4 text-safe-blue">Backend Status</h3>
              {backendStatus.loading ? (
                <div className="text-center text-gray-400 py-4">
                  <div className="animate-spin w-8 h-8 border-4 border-safe-blue border-t-transparent rounded-full mx-auto" />
                  <p className="mt-2">Connecting...</p>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Connection:</span>
                    <span className={backendStatus.connected ? 'text-safe-success' : 'text-safe-danger'}>
                      {backendStatus.connected ? '✅ Connected' : '❌ Disconnected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Version:</span>
                    <span>{backendStatus.version || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Environment:</span>
                    <span className="capitalize">{backendStatus.environment || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Uptime:</span>
                    <span>{backendStatus.uptime > 0 ? `${backendStatus.uptime}s` : 'N/A'}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-safe-gray/60 rounded-lg p-6 border border-safe-gray-light">
              <h3 className="text-sm font-semibold mb-4 text-safe-blue">Connection Tests</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Health Check:</span>
                  <span className="font-mono">{testResults.healthCheck}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">API Endpoint:</span>
                  <span className="font-mono">{testResults.apiTest}</span>
                </div>
                <button onClick={testBackendConnection} className="mt-4 w-full bg-safe-blue hover:bg-safe-blue-light text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  Re-test Connection
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-safe-gray-light/40 rounded-xl p-6 border border-safe-gray-light">
            <h3 className="text-sm font-semibold mb-4 text-safe-blue">Frontend Stack</h3>
            <ul className="space-y-2 text-gray-300 text-xs">
              <li>React 18</li>
              <li>Vite Build Tool</li>
              <li>Tailwind CSS</li>
              <li>Redux Toolkit</li>
              <li>Socket.IO Client</li>
            </ul>
          </div>
          <div className="bg-safe-gray-light/40 rounded-xl p-6 border border-safe-gray-light">
            <h3 className="text-sm font-semibold mb-4 text-safe-blue">Backend Stack</h3>
            <ul className="space-y-2 text-gray-300 text-xs">
              <li>Node.js (LTS)</li>
              <li>Express.js</li>
              <li>Winston Logger</li>
              <li>Zod Validation</li>
              <li>MQTT + Socket.IO</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemTestPage;
