import { useState } from 'react';
import { useRouter } from 'next/router';
import API from '@/utils/axios';
import { Loader2, Mail, Lock, AlertCircle, ExternalLink } from 'lucide-react';

export default function ConnectYahoo() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await API.post('/yahoo/connect', { email, appPassword });
      alert('Yahoo account connected successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to connect Yahoo account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="bg-gray-800 p-8 rounded-2xl max-w-lg w-full shadow-2xl border border-gray-700">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-purple-600 p-3 rounded-full">
            <Mail className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2 text-center">Connect Yahoo Mail</h1>
        <p className="text-gray-400 text-center mb-8">
          Securely connect your Yahoo Mail account to send and receive encrypted emails
        </p>
        
        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-900/30 rounded-lg border border-blue-700">
          <h3 className="font-semibold text-blue-300 mb-3 flex items-center">
            <Lock className="w-4 h-4 mr-2" />
            How to get Yahoo App Password:
          </h3>
          <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
            <li>Go to <a href="https://login.yahoo.com/account/security" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center">Yahoo Account Security <ExternalLink className="w-3 h-3 ml-1" /></a></li>
            <li>Scroll down and click <strong>"Generate app password"</strong></li>
            <li>Select <strong>"Other App"</strong> and enter "Qumail"</li>
            <li>Click <strong>"Generate"</strong> and copy the password</li>
            <li>Paste the password below (remove spaces if any)</li>
          </ol>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleConnect} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Yahoo Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-3 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="your@yahoo.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              App Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={appPassword}
                onChange={(e) => setAppPassword(e.target.value.replace(/\s/g, ''))} // Remove spaces
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-3 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                placeholder="abcd efgh ijkl mnop"
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">16-character app password from Yahoo</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Mail className="w-5 h-5" />
                <span>Connect Yahoo Account</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-400 text-center">
            🔒 Your credentials are encrypted and stored securely. We never store your actual password.
          </p>
        </div>
      </div>
    </div>
  );
}
