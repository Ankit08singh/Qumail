import { signIn, getSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Lock, ChevronLeft } from "lucide-react";
import Image from "next/image";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="flex justify-center items-center space-x-2 sm:space-x-4">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-blue-400 transition-colors duration-200">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          
          <Link href="/" className="flex items-center space-x-3 group">
            <Image
              src="/logo.png"
              alt="QuMail"
              width={140}
              height={40}
              className="h-12 w-auto"
              priority
            />
            <span className="text-3xl font-bold text-white group-hover:text-blue-200 transition-colors duration-300">
              QuMail
            </span>
          </Link>
        </div>
        
        <div className="mt-8 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-2">
            Secure Access
          </h2>
          <p className="text-lg text-gray-300">
            Enter the quantum-secured communication platform
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mt-12 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-2xl sm:rounded-3xl py-8 sm:py-10 px-6 sm:px-8 shadow-2xl">
          <div className="space-y-8">
            {/* Welcome Message */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
              </div>
              <p className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed">
                Access your quantum-secured communication platform with enterprise-grade authentication.
              </p>
            </div>

            {/* Google Sign In Button */}
            <div>
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 sm:py-4 px-6 bg-blue-600 hover:bg-blue-500 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 border border-blue-400/30"
              >
                <div className="relative flex items-center">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="font-semibold text-white text-lg">Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 mr-4" viewBox="0 0 24 24">
                        <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="font-semibold text-white text-lg">Continue with Google</span>
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-900 text-gray-400 rounded-full">Secure Authentication</span>
              </div>
            </div>




          </div>
        </div>

        {/* Terms and Privacy */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400 leading-relaxed">
            By signing in, you agree to our{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200">
              Privacy Policy
            </a>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Secured by QuMail Quantum Infrastructure
          </p>
        </div>
      </div>
    </div>
  );
}

// Redirect if already authenticated
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (session) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};