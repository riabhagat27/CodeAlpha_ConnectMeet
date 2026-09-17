import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, LogIn, ArrowRight } from 'lucide-react';
import { meetingService } from '../services/api';

const JoinMeetingModal = ({ isOpen, onClose }) => {
  const [meetingCodeInput, setMeetingCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  if (!isOpen) return null;

  // Extract room code if user pastes a full URL e.g. http://localhost:5173/meeting/ABC-123-XYZ
  const extractCode = (input) => {
    let raw = input.trim();
    if (raw.includes('/meeting/')) {
      raw = raw.split('/meeting/')[1];
    }
    return raw.toUpperCase().trim();
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    const cleanCode = extractCode(meetingCodeInput);

    if (!cleanCode) {
      setError('Please enter a valid meeting code or link.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await meetingService.getMeetingByCode(cleanCode);
      if (res.success && res.data) {
        onClose();
        navigate(`/meeting/${cleanCode}`);
      }
    } catch (err) {
      console.error('Error validating meeting code:', err);
      setError(err.response?.data?.message || 'Invalid meeting code. Room not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setMeetingCodeInput('');
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
            <LogIn className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Join Meeting</h3>
            <p className="text-xs text-slate-400">Enter a meeting code or invitation link</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Meeting Code
            </label>
            <input
              type="text"
              value={meetingCodeInput}
              onChange={(e) => setMeetingCodeInput(e.target.value)}
              placeholder="e.g. ABC-123-XYZ"
              className="w-full bg-slate-950 text-slate-100 font-mono text-sm px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600 placeholder:font-sans uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !meetingCodeInput.trim()}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Validating Room...' : 'Join Room'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinMeetingModal;
