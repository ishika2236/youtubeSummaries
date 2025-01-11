import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSignInEmailPassword } from '@nhost/react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showVerificationReminder, setShowVerificationReminder] = useState(false);
  const { signInEmailPassword, isLoading, error } = useSignInEmailPassword();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error, needsEmailVerification } = await signInEmailPassword(email, password);

    if (error) {
      if (error.error === 'unverified-user') {
        setShowVerificationReminder(true);
        toast.error('Please verify your email before signing in');
      } else {
        toast.error(error.message);
        setShowVerificationReminder(false);
      }
    } else {
      toast.success('Successfully signed in!');
      navigate('/');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
        </div>

        {showVerificationReminder && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 text-yellow-500 mb-2">
              <Mail className="flex-shrink-0" size={20} />
              <h3 className="font-semibold">Email Verification Required</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Please check your email ({email}) and click the verification link to activate your account.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Can't find the email? Check your spam folder or&nbsp;
              
            </p>
          </motion.div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                'Sign in'
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default Login;