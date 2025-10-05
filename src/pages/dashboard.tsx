import { useSession, signOut } from "next-auth/react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { 
  CheckCircle, 
  User, 
  Mail, 
  Image as ImageIcon, 
  FileText, 
  Shield, 
  Home, 
  Send, 
  RefreshCw,
  Zap,
  LogOut
} from "lucide-react";
import API from "@/utils/axios";

export default function Dashboard() {
  const { data: session } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [result, setResult] = useState(null);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: "/" });
  };

  const testSession = async () => {
        try {
            // In Next.js, if both frontend and backend are on same domain,
            // cookies are automatically included
            const response = await API.get('/auth/debug-session');
            setResult(response.data);
            console.log('Session result:', response.data);
        } catch (error:any) {
            console.error('Error:', error);
            setResult(error.message );
        }
    };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white group-hover:text-purple-200 transition-colors duration-300">MyApp</span>
              </Link>
              <div className="hidden sm:block">
                <span className="text-white/60 text-lg">•</span>
                <span className="ml-2 text-white/80 font-medium">Dashboard</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
                <div className="text-wrap"></div>
              {session.user?.image && (
                <div className="relative">
                  <img
                    className="h-10 w-10 rounded-full border-2 border-white/30 hover:border-white/50 transition-colors duration-300"
                    src={session.user.image}
                    alt={session.user.name || "User"}
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
              )}
              <div className="hidden sm:block text-right">
                <p className="text-white font-medium">{session.user?.name}</p>
                <p className="text-white/60 text-sm">{session.user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {isSigningOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl mb-8 overflow-hidden">
            <div className="px-8 py-8 sm:p-10">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome back, {session.user?.name?.split(' ')[0]}! 👋
                  </h1>
                  <p className="text-white/80 text-lg">
                    You're successfully authenticated and ready to explore all features.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-green-300">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Secure Google OAuth Authentication Active</span>
              </div>
            </div>
          </div>

          {/* User Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profile Information */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-xl overflow-hidden">
              <div className="px-6 py-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="ml-4 text-xl font-bold text-white">
                    Profile Information
                  </h3>
                </div>
                <div className="space-y-6">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-white/60">Full Name</p>
                        <p className="text-lg font-semibold text-white">{session.user?.name}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                          <Mail className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-white/60">Email Address</p>
                        <p className="text-lg font-semibold text-white">{session.user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  {session.user?.image && (
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4 flex items-center">
                          <div>
                            <p className="text-sm font-medium text-white/60">Profile Picture</p>
                            <p className="text-lg font-semibold text-white">Google Avatar</p>
                          </div>
                          <img
                            className="ml-4 h-12 w-12 rounded-xl border-2 border-white/30"
                            src={session.user.image}
                            alt="Profile"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Session Information */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-xl overflow-hidden">
              <div className="px-6 py-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="ml-4 text-xl font-bold text-white">
                    Session Information
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-white/80">Authentication Status</p>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                        Active
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-white/60">Provider</p>
                        <p className="text-white font-medium">Google OAuth 2.0</p>
                      </div>
                      <div>
                        <p className="text-white/60">Session ID</p>
                        <p className="text-white font-medium font-mono text-xs">{session.user?.email?.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-white/80">Session Details</p>
                      <button 
                        className="text-xs text-purple-300 hover:text-purple-200 transition-colors"
                        onClick={() => {const pre = document.getElementById('session-data'); if (pre) pre.style.display = pre.style.display === 'none' ? 'block' : 'none';}}
                      >
                        Toggle View
                      </button>
                    </div>
                    <pre id="session-data" className="mt-2 text-xs text-white/70 bg-black/20 p-3 rounded-xl overflow-auto max-h-40 border border-white/10" style={{display: 'none'}}>
                      {JSON.stringify(session, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-xl overflow-hidden">
            <div className="px-6 py-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="ml-4 text-xl font-bold text-white">
                  Quick Actions
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  href="/"
                  className="group bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-2xl p-4 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Home className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-white font-semibold">Homepage</p>
                      <p className="text-white/60 text-sm">Return to main</p>
                    </div>
                  </div>
                </Link>
                
                <Link
                  href="/gmail-demo"
                  className="group bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-2xl p-4 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Send className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-white font-semibold">Gmail API</p>
                      <p className="text-white/60 text-sm">Email features</p>
                    </div>
                  </div>
                </Link>
                
                <button
                  onClick={() => window.location.reload()}
                  className="group bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-2xl p-4 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <RefreshCw className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-white font-semibold">Refresh</p>
                      <p className="text-white/60 text-sm">Reload session</p>
                    </div>
                  </div>
                </button>

                <div className="border border-black flex items-center justify-between p-6 h-16">
                  <button onClick={testSession} >Test NextAuth Session</button>
                  {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
              </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Protect the dashboard route
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};