import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Youtube, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthenticationStatus, useUserData } from '@nhost/react';
import { nhost } from '../lib/nhost';

function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const user = useUserData();

  useEffect(() => {
    console.log('Auth Status:', { isAuthenticated, isLoading, user });
  }, [isAuthenticated, isLoading, user]);

  const saveSummaryToProfile = async (videoUrl: string, summaryText: string) => {
    if (!user?.id) {
      console.error('No user ID available');
      return;
    }

    const mutation = `
      mutation SaveSummary($userId: uuid!, $url: String!, $summary: String!) {
         insert_summary(object: {
          user_id: $userId,
          youtube_url: $url,
          summary: $summary
        }) {
          id
          user_id
          youtube_url
          summary
        }
      }
    `;

    try {
      const { data, error: graphqlError } = await nhost.graphql.request(mutation, {
        userId: user.id,
        url: videoUrl,
        summary: summaryText
      });

      if (graphqlError) {
        throw new Error(Array.isArray(graphqlError) 
          ? graphqlError[0]?.message 
          : 'Failed to save summary');
      }

      console.log('Summary saved successfully:', data);
      toast.success('Summary saved to your profile!');
    } catch (error) {
      // console.error('Failed to save summary:', error);
      toast.error('Failed to save summary to profile');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast.error('Please enter a YouTube URL');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5678/webhook/5736a863-0d74-4916-b9bb-2dfc7baa2998', {
        youtubeLink: url
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data?.summary) {
        setSummary(response.data.summary);
        
        if (isAuthenticated && user) {
          await saveSummaryToProfile(url, response.data.summary);
        }
        
        toast.success('Summary generated successfully!');
      } else {
        throw new Error('No summary received from the API');
      }
    } catch (error) {
      let errorMessage = 'Failed to generate summary';
      if (axios.isAxiosError(error)) {
        if (error.code === 'ERR_NETWORK') {
          errorMessage = 'Cannot connect to the summarization service. Please ensure the service is running.';
        } else if (error.response?.status === 429) {
          errorMessage = 'Too many requests. Please try again later.';
        } else if (error.response?.status === 400) {
          errorMessage = 'Invalid YouTube URL. Please check the URL and try again.';
        }
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-12">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="inline-block p-4 bg-blue-600 rounded-full mb-6"
          >
            <Youtube size={48} className="text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-4">
            YouTube Video Summarizer
          </h1>
          <p className="text-gray-300 text-lg">
            Get instant AI-powered summaries of any YouTube video
          </p>
          {isAuthenticated && user && (
            <p className="text-green-400 mt-2">
              Logged in as {user.email}
            </p>
          )}
        </div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube URL here..."
              className="w-full px-6 py-4 bg-gray-800 text-white rounded-lg border-2 border-blue-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200"
            />
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="absolute right-2 top-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                'Generate Summary'
              )}
            </motion.button>
          </div>
        </motion.form>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500 p-4 rounded-lg mb-8"
          >
            <div className="flex items-center text-red-500 mb-2">
              <AlertCircle className="mr-2" size={20} />
              <h3 className="font-semibold">Error</h3>
            </div>
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}

        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 p-6 rounded-lg shadow-xl border border-blue-500"
          >
            <h2 className="text-2xl font-semibold text-white mb-4">Summary</h2>
            <p className="text-gray-300 leading-relaxed">{summary}</p>
          </motion.div>
        )}

        {!isLoading && !isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <p className="text-gray-300 mb-4">
              Want to save your summaries? Create an account!
            </p>
            <motion.a
              href="/register"
              whileHover={{ scale: 1.05 }}
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Sign Up Now
            </motion.a>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default Home;