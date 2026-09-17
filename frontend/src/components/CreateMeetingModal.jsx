import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Copy, Check, Video, ArrowRight } from 'lucide-react';
import { meetingService } from '../services/api';

const CreateMeetingModal = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await meetingService.createMeeting(title);
      if (res.success && res.data) {
        setCreatedMeeting(res.data);
      }
    } catch (err) {
      console.error('Error creating meeting:', err);
      setError(err.response?.data?.message || 'Failed to create meeting.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!createdMeeting) return;
    const meetingUrl = `${window.location.origin}/meeting/${createdMeeting.meeting_code}`;
    navigator.clipboard.writeText(meetingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleJoinNow = () => {
    if (createdMeeting) {
      navigate(`/meeting/${createdMeeting.meeting_code}`);
    }
  };

  const handleCloseModal = () => {
    setCreatedMeeting(null);
    setTitle('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden p-6 relative">
        <button
          onClick={handleCloseModal}
          className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Create New Meeting</h3>
            <p className="text-xs text-slate-400">Generate a instant room code for video calling</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {!createdMeeting ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Meeting Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. CodeAlpha Sprint Sync"
                className="w-full bg-slate-950 text-slate-100 text-sm px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Creating Room...' : 'Create Meeting Room'}
            </button>
          </form>
        ) : (
          <div className="space-y-5 animate-in slide-in-from-bottom-3 duration-200">
            <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-200 text-sm font-medium flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Meeting created successfully!</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Meeting Code & Shareable Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/meeting/${createdMeeting.meeting_code}`}
                  className="flex-1 bg-slate-950 text-indigo-400 font-mono text-sm px-3.5 py-2.5 rounded-xl border border-slate-800 select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors shrink-0"
                  title="Copy Meeting Link"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleJoinNow}
                className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Join Meeting Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateMeetingModal;
