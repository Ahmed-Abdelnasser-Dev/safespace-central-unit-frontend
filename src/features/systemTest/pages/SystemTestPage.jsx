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
      <div className="max-w-4xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="mb-10 animate-slideUp">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-safe-blue/20 to-safe-blue/5 rounded-xl flex items-center justify-center border border-safe-blue/30">
              <FontAwesomeIcon icon="server" className="text-safe-blue text-2xl" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-white">System Diagnostics</h1>
              <p className="text-base text-safe-text-gray/80 font-light mt-2">Test connection between Frontend (React + Vite) and Backend (Node.js + Express)</p>
            </div>
          </div>
        </div>

        {/* Test Button */}
        <div className="mb-8 animate-slideUp stagger-1">
          <button
            onClick={testBackendConnection}
            className="px-6 py-3 rounded-lg bg-safe-blue hover:bg-safe-blue/90 text-white font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2"
          >
            <FontAwesomeIcon icon={backendStatus.loading ? "spinner" : "play"} className={backendStatus.loading ? "animate-spin" : ""} />
            {backendStatus.loading ? "Testing..." : "Run Diagnostics"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slideUp stagger-2">
          {/* Backend Status Card */}
          <div className="bg-white rounded-xl p-6 border border-safe-border/50 shadow-card hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-safe-blue/10 flex items-center justify-center">
                <FontAwesomeIcon icon="server" className="text-safe-blue text-lg" />
              </div>
              <h3 className="text-sm font-bold text-safe-text-dark uppercase tracking-wider">Backend Status</h3>
            </div>

            {backendStatus.loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-10 h-10 border-4 border-safe-blue border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-safe-text-gray font-light">Connecting...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-safe-gray/5 rounded-lg">
                  <span className="text-sm text-safe-text-gray">Status</span>
                  <span className={`font-semibold text-sm ${backendStatus.connected ? 'text-safe-green' : 'text-safe-danger'}`}>
                    {backendStatus.connected ? '✅ Connected' : '❌ Disconnected'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-safe-gray/5 rounded-lg">
                  <span className="text-sm text-safe-text-gray">Version</span>
                  <span className="font-medium text-safe-text-dark">{backendStatus.version || '—'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-safe-gray/5 rounded-lg">
                  <span className="text-sm text-safe-text-gray">Environment</span>
                  <span className="font-medium text-safe-text-dark capitalize">{backendStatus.environment || '—'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-safe-gray/5 rounded-lg">
                  <span className="text-sm text-safe-text-gray">Uptime</span>
                  <span className="font-medium text-safe-text-dark">{backendStatus.uptime > 0 ? `${backendStatus.uptime}s` : '—'}</span>
                </div>
                </div>
              )}
            )}
          </div>

          {/* Test Results Card */}
          <div className="bg-white rounded-xl p-6 border border-safe-border/50 shadow-card hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-safe-blue/10 flex items-center justify-center">
                <FontAwesomeIcon icon="flask" className="text-safe-blue text-lg" />
              </div>
              <h3 className="text-sm font-bold text-safe-text-dark uppercase tracking-wider">Connection Tests</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-safe-gray/5 rounded-lg">
                <span className="text-sm text-safe-text-gray">Health Check</span>
                <span className="font-mono text-sm font-semibold">{testResults.healthCheck}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-safe-gray/5 rounded-lg">
                <span className="text-sm text-safe-text-gray">API Endpoint</span>
                <span className="font-mono text-sm font-semibold">{testResults.apiTest}</span>
              </div>

              <button 
                type="button" 
                onClick={testBackendConnection}
                disabled={backendStatus.loading}
                className="mt-4 w-full px-4 py-2.5 bg-safe-blue hover:bg-safe-blue/90 disabled:bg-safe-gray/40 text-white font-semibold text-sm rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={backendStatus.loading ? "spinner" : "rotate"} className={backendStatus.loading ? "animate-spin" : ""} />
                {backendStatus.loading ? "Testing..." : "Re-test Connection"}
              </button>
            </div>
          </div>
        </div>

        {/* Stack Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 animate-slideUp stagger-3">
          <div className="bg-white rounded-xl p-6 border border-safe-border/50 shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-safe-accent/10 flex items-center justify-center">
                <FontAwesomeIcon icon="code" className="text-safe-accent text-lg" />
              </div>
              <h3 className="text-sm font-bold text-safe-text-dark uppercase tracking-wider">Frontend Stack</h3>
            </div>
            <ul className="space-y-2 text-safe-text-gray text-sm font-light">
              <li className="flex items-center gap-2"><span className="text-safe-accent">✓</span> React 18</li>
              <li className="flex items-center gap-2"><span className="text-safe-accent">✓</span> Vite Build Tool</li>
              <li className="flex items-center gap-2"><span className="text-safe-accent">✓</span> Tailwind CSS</li>
              <li className="flex items-center gap-2"><span className="text-safe-accent">✓</span> Redux Toolkit</li>
              <li className="flex items-center gap-2"><span className="text-safe-accent">✓</span> Socket.IO Client</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 border border-safe-border/50 shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-safe-blue/10 flex items-center justify-center">
                <FontAwesomeIcon icon="cube" className="text-safe-blue text-lg" />
              </div>
              <h3 className="text-sm font-bold text-safe-text-dark uppercase tracking-wider">Backend Stack</h3>
            </div>
            <ul className="space-y-2 text-safe-text-gray text-sm font-light">
              <li className="flex items-center gap-2"><span className="text-safe-blue">✓</span> Node.js (LTS)</li>
              <li className="flex items-center gap-2"><span className="text-safe-blue">✓</span> Express.js</li>
              <li className="flex items-center gap-2"><span className="text-safe-blue">✓</span> Winston Logger</li>
              <li className="flex items-center gap-2"><span className="text-safe-blue">✓</span> Zod Validation</li>
              <li className="flex items-center gap-2"><span className="text-safe-blue">✓</span> MQTT + Socket.IO</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemTestPage;
