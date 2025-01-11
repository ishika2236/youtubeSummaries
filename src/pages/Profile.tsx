import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText } from 'lucide-react';
import { useUserData } from '@nhost/react';
import { jsPDF } from 'jspdf';

interface Summary {
  id: string;
  youtube_url: string;
  summary: string;
  created_at: string;
}

function Profile() {
  const user = useUserData();
  const [summaries, setSummaries] = useState<Summary[]>([]);

  useEffect(() => {
    if (user) {
      fetchSummaries();
    }
  }, [user]);

  const fetchSummaries = async () => {
    const { data } = await nhost.graphql.request(`
      query GetSummaries($userId: uuid!) {
        summaries(where: { user_id: { _eq: $userId } }, order_by: { created_at: desc }) {
          id
          youtube_url
          summary
          created_at
        }
      }
    `, {
      userId: user?.id
    });
    setSummaries(data.summaries);
  };

  const downloadTxt = (summary: Summary) => {
    const element = document.createElement('a');
    const file = new Blob([summary.summary], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `summary-${summary.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadPdf = (summary: Summary) => {
    const doc = new jsPDF();
    doc.text(summary.summary, 10, 10);
    doc.save(`summary-${summary.id}.pdf`);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Profile</h1>
          <p className="text-gray-300">{user?.email}</p>
        </div>

        <h2 className="text-2xl font-bold text-white mb-6">Your Summaries</h2>

        <div className="space-y-6">
          {summaries.map((summary) => (
            <motion.div
              key={summary.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-800 rounded-lg p-6 border border-blue-500"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-white">
                  {new URL(summary.youtube_url).pathname.split('v=')[1]}
                </h3>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => downloadTxt(summary)}
                    className="p-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <FileText className="text-white" size={20} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => downloadPdf(summary)}
                    className="p-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Download className="text-white" size={20} />
                  </motion.button>
                </div>
              </div>
              <p className="text-gray-300">{summary.summary}</p>
              <p className="text-sm text-gray-400 mt-4">
                {new Date(summary.created_at).toLocaleDateString()}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default Profile;