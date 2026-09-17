import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, ArrowLeft, ArrowRight } from 'lucide-react';
import { meetingService } from '../services/api';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';

const JoinMeetingPage = () => {
  const [meetingCode, setMeetingCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    let cleanCode = meetingCode.trim();

    if (cleanCode.includes('/meeting/')) {
      cleanCode = cleanCode.split('/meeting/')[1];
    }
    cleanCode = cleanCode.toUpperCase().trim();

    if (!cleanCode) {
      setError('Please enter a valid meeting code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await meetingService.getMeetingByCode(cleanCode);
      if (res.success && res.data) {
        navigate(`/meeting/${cleanCode}`);
      }
    } catch (err) {
      console.error('Error validating room:', err);
      setError(err.response?.data?.message || 'Invalid meeting code. Room not found.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <Toast message={error} type="error" onClose={() => setError('')} />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <LogIn className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Join Meeting</h1>
              <p className="text-xs text-slate-400">Enter code e.g. ABC-123-XYZ</p>
            </div>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Meeting Code or URL</label>
              <input
                type="text"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                placeholder="ABC-123-XYZ"
                className="w-full bg-slate-900 text-slate-100 font-mono text-sm px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors uppercase"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !meetingCode.trim()}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Validating Room...' : 'Enter Room'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default JoinMeetingPage;
