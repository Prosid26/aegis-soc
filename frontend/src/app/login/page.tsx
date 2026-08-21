'use client';

import { useState } from 'react';
import {
  ShieldAlert,
  Terminal,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { authUtils } from '@/lib/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Create form data for OAuth2PasswordRequestForm
      const formData = new URLSearchParams();
formData.append('username', username);
formData.append('password', password);

const response = await apiClient.post('/auth/login', formData, {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

      const { access_token } = response.data;

      // Store the token using authUtils
      authUtils.setAuthData(access_token);

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('Login failed:', err);

      if (err?.response?.status === 401) {
        setError('Invalid username or password');
      } else {
        setError('Authentication service unavailable. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated, redirect to dashboard
  // Note: This check runs on the client side after hydration
  // For server-side protection, we'd need middleware or getServerSideProps
  // but for now, client-side redirect is acceptable

  return (
    <div className="min-h-screen bg-[#03070b] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <ShieldAlert className="h-10 w-10 text-cyber-blue" />
          <div className="space-y-1">
            <p className="text-white font-extrabold text-lg tracking-tight">
              AEGIS<span className="text-cyber-blue">SOC</span>
            </p>
            <p className="text-zinc-400 font-mono text-xs">Security Operations Center</p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5 bg-panel/20 border border-panel-border/30 rounded-xl p-8 backdrop-blur-md">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Terminal className="h-5 w-5 text-cyber-blue" />
              <span className="font-mono text-zinc-400 text-xs uppercase tracking-widest">CREDENTIAL VERIFICATION</span>
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">USERNAME</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full bg-[#020508] border border-panel-border rounded py-3 pl-4 pr-4 text-xs font-mono text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-cyber-blue/50 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-[#020508] border border-panel-border rounded py-3 pl-4 pr-4 text-xs font-mono text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-cyber-blue/50 transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-3 p-4 bg-severity-critical/10 border border-severity-critical/20 rounded">
              <AlertTriangle className="h-5 w-5 text-severity-critical" />
              <span className="font-mono text-zinc-400 text-xs">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex h-12 items-center justify-center rounded bg-cyber-blue px-6 text-sm font-semibold text-[#03070b] hover:bg-primary-hover transition-all duration-300 ${
              loading ? 'opacity-70' : ''
            }`}
          >
            {loading ? (
              <>
                <Activity className="h-4 w-4 mr-2 animate-spin" />
                <span>AUTHENTICATING...</span>
              </>
            ) : (
              <>
                <Activity className="h-4 w-4 mr-2" />
                <span>ACCESS CONSOLE</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-8 space-y-3 font-mono text-[9px] text-zinc-500">
          <p>
            <span className="text-zinc-400">DEFAULT CREDENTIALS:</span><br/>
            <span className="text-zinc-300">admin / admin123</span><br/>
            <span className="text-zinc-300">analyst / analyst123</span><br/>
            <span className="text-zinc-300">viewer / viewer123</span>
          </p>
          <p className="text-zinc-500">
            For security, please change passwords after first login.
          </p>
        </div>
      </div>
    </div>
  );
}