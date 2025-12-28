import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import API from '@/utils/axios';

interface KeyDetail {
  keyId: string;
  status: 'UNUSED' | 'ACTIVE';
  usedBy?: string;
  usedAt?: string;
  expiresAt: string;
}

interface Bucket {
  bucketId: string;
  partner: string;
  totalKeys: number;
  unusedCount: number;
  activeCount: number;
  createdBy: string;
  createdAt: string;
  warnings: string[];
  keyDetails: KeyDetail[];
}

interface BucketStats {
  totalBuckets: number;
  totalUnusedKeys: number;
  lowKeyBuckets: number;
  emptyBuckets: number;
}

const KeyManagement: React.FC = () => {
  const { data: session } = useSession();
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [newPartner, setNewPartner] = useState('');
  const [ttlDays, setTtlDays] = useState(7);
  const [refillBucketId, setRefillBucketId] = useState('');
  const [expandedBucket, setExpandedBucket] = useState<string | null>(null);
  
  // Stats
  const [stats, setStats] = useState<BucketStats>({
    totalBuckets: 0,
    totalUnusedKeys: 0,
    lowKeyBuckets: 0,
    emptyBuckets: 0
  });

  // Fetch all buckets on mount
  useEffect(() => {
    if (session?.accessToken) {
      fetchBuckets();
    }
  }, [session]);

  // Calculate stats whenever buckets change
  useEffect(() => {
    if (buckets.length > 0) {
      const totalUnused = buckets.reduce((sum, b) => sum + b.unusedCount, 0);
      const lowKey = buckets.filter(b => b.warnings.includes('LOW_KEYS')).length;
      const empty = buckets.filter(b => b.warnings.includes('EMPTY')).length;
      
      setStats({
        totalBuckets: buckets.length,
        totalUnusedKeys: totalUnused,
        lowKeyBuckets: lowKey,
        emptyBuckets: empty
      });
    }
  }, [buckets]);

  const fetchBuckets = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get('/keys/buckets');
      
      if (response.data.success) {
        setBuckets(response.data.buckets);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch buckets');
      console.error('Fetch buckets error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateBucket = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await API.post('/keys/generate', {
        partner: newPartner,
        ttlDays
      });
      
      if (response.data.success) {
        setSuccess(`Bucket created with ${response.data.totalKeys} keys for ${newPartner}`);
        setNewPartner('');
        setTtlDays(7);
        await fetchBuckets();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate bucket');
      console.error('Generate bucket error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refillBucket = async (bucketId: string) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await API.post('/keys/refill', {
        bucketId,
        ttlDays
      });
      
      if (response.data.success) {
        setSuccess(`Added ${response.data.keysAdded} keys to bucket`);
        await fetchBuckets();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to refill bucket');
      console.error('Refill bucket error:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteBucket = async (bucketId: string) => {
    if (!confirm('Are you sure you want to delete this bucket? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await API.delete(`/keys/buckets/${bucketId}`);
      
      if (response.data.success) {
        setSuccess('Bucket deleted successfully');
        await fetchBuckets();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete bucket');
      console.error('Delete bucket error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWarningBadge = (warnings: string[]) => {
    if (warnings.includes('EMPTY')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          EMPTY
        </span>
      );
    }
    if (warnings.includes('LOW_KEYS')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          LOW KEYS
        </span>
      );
    }
    if (warnings.includes('EXPIRING_SOON')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          EXPIRING SOON
        </span>
      );
    }
    return null;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleBucketDetails = (bucketId: string) => {
    setExpandedBucket(expandedBucket === bucketId ? null : bucketId);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <h2 className="card-title">Authentication Required</h2>
            <p>Please log in to access Key Management</p>
          </div>
        </div>
      </div>
    );
  }
  const handleRetrieve = async () => {
    try {
      const response = await API.get(`/keys/buckets/${buckets}/verify`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`
          }
        }
      );
    }catch(err){
        console.log("hello");
    }
  }
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🔐 Key Management Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Manage your QKD encryption key buckets for secure communication
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Buckets</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{stats.totalBuckets}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Available Keys</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.totalUnusedKeys}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Low Key Buckets</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{stats.lowKeyBuckets}</p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Empty Buckets</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{stats.emptyBuckets}</p>
              </div>
              <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg animate-pulse">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg animate-pulse">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-700 dark:text-green-300 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Generate New Bucket Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Key Bucket
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={generateBucket} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Partner Email
                  </label>
                  <input
                    type="email"
                    placeholder="recipient@example.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={newPartner}
                    onChange={(e) => setNewPartner(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    TTL (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={ttlDays}
                    onChange={(e) => setTtlDays(parseInt(e.target.value))}
                    required
                  />
                </div>
                
                <div className="flex items-end">
                  <button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Getting...
                      </span>
                    ) : 'Get 100 Keys'}
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                💡 Creates a shared bucket with 100 QKD keys (1024 bits each) for secure communication with the specified partner.
              </p>
            </form>
          </div>
        </div>

        {/* Buckets List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Your Key Buckets
            </h2>
            <button 
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
              onClick={handleRetrieve}
              disabled={loading}
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retrieve
            </button>
          </div>
          
          <div className="p-6">
            {loading && buckets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <svg className="animate-spin h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600 dark:text-gray-400">Loading your key buckets...</p>
              </div>
            ) : buckets.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full mb-4">
                  <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No key buckets yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first bucket above to start secure communication</p>
              </div>
            ) : (
              <div className="space-y-4">
                {buckets.map((bucket) => (
                  <div 
                    key={bucket.bucketId} 
                    className={`bg-white dark:bg-gray-700 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${
                      bucket.warnings.includes('EMPTY') ? 'border-2 border-red-500' :
                      bucket.warnings.includes('LOW_KEYS') ? 'border-2 border-yellow-500' :
                      'border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="p-6">
                      {/* Bucket Header */}
                      <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-3 py-1 rounded-lg">
                              <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{session.user?.email}</span>
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                              </svg>
                              <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{bucket.partner}</span>
                            </div>
                            {getWarningBadge(bucket.warnings)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-1">
                            <p className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Created by: <span className="font-medium">{bucket.createdBy === session.user?.email ? 'You' : bucket.createdBy}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatDate(bucket.createdAt)}
                            </p>
                            <p className="flex items-center gap-2 font-mono text-xs">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              ID: {bucket.bucketId.substring(0, 24)}...
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 min-w-[280px]">
                          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-3 text-center">
                            <p className="text-xs text-green-700 dark:text-green-400 font-medium mb-1">Unused</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{bucket.unusedCount}</p>
                          </div>
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3 text-center">
                            <p className="text-xs text-blue-700 dark:text-blue-400 font-medium mb-1">Active</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{bucket.activeCount}</p>
                          </div>
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-3 text-center">
                            <p className="text-xs text-gray-700 dark:text-gray-300 font-medium mb-1">Total</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">{bucket.totalKeys}</p>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Capacity</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{bucket.totalKeys}/100 keys</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              bucket.totalKeys < 20 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                              bucket.totalKeys < 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                              'bg-gradient-to-r from-green-500 to-green-600'
                            }`}
                            style={{ width: `${bucket.totalKeys}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <button 
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => refillBucket(bucket.bucketId)}
                          disabled={loading || bucket.totalKeys >= 100}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Refill to 100
                        </button>
                        <button 
                          className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                          onClick={() => toggleBucketDetails(bucket.bucketId)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expandedBucket === bucket.bucketId ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                          </svg>
                          {expandedBucket === bucket.bucketId ? 'Hide' : 'View'} Details
                        </button>
                        <button 
                          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 ml-auto disabled:opacity-50"
                          onClick={() => deleteBucket(bucket.bucketId)}
                          disabled={loading}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>

                      {/* Expanded Key Details */}
                      {expandedBucket === bucket.bucketId && (
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600 animate-in slide-in-from-top duration-300">
                          <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Individual Key Details ({bucket.keyDetails.length} keys)
                          </h4>
                          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                <tr>
                                  <th className="px-4 py-3 text-left font-semibold">Key ID</th>
                                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                                  <th className="px-4 py-3 text-left font-semibold">Used By</th>
                                  <th className="px-4 py-3 text-left font-semibold">Used At</th>
                                  <th className="px-4 py-3 text-left font-semibold">Expires At</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                {bucket.keyDetails.map((key, idx) => (
                                  <tr key={key.keyId} className={`${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'} hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors`}>
                                    <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{key.keyId.substring(0, 24)}...</td>
                                    <td className="px-4 py-3">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        key.status === 'UNUSED' 
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                      }`}>
                                        {key.status}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{key.usedBy || '-'}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{key.usedAt ? formatDate(key.usedAt) : '-'}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(key.expiresAt)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyManagement;
