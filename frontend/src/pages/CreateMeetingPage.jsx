import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Video, ArrowLeft, Plus } from 'lucide-react';
import { meetingService } from '../services/api';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';

const CreateMeetingPage = () => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await meetingService.createMeeting(title);
      if (res.success && res.data) {
        navigate(`/meeting/${res.data.meeting_code}`);
      }
    } catch (err) {
      console.error('Error creating meeting:', err);
      setError(err.response?.data?.message || 'Failed to create meeting.');
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
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Create New Meeting</h1>
              <p className="text-xs text-slate-400">Start an instant conference room</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Meeting Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Project Review Session"
                className="w-full bg-slate-900 text-slate-100 text-sm px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Generating Room...' : 'Start Meeting'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateMeetingPage;
