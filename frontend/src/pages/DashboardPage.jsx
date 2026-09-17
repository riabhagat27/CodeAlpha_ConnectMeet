import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, LogIn, Calendar, Clock, Copy, Check, Video, ArrowRight, Trash2, ShieldCheck, Activity, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { meetingService } from '../services/api';
import Sidebar from '../components/Sidebar';
import CreateMeetingModal from '../components/CreateMeetingModal';
import JoinMeetingModal from '../components/JoinMeetingModal';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await meetingService.getMeetings();
      if (res.success && res.data) {
        setMeetings(res.data);
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleCopyLink = (code) => {
    const meetingUrl = `${window.location.origin}/meeting/${code}`;
    navigator.clipboard.writeText(meetingUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const handleDeleteMeeting = async (code) => {
    try {
      const res = await meetingService.deleteMeeting(code);
      if (res.success) {
        setMeetings((prev) => prev.filter((m) => m.meeting_code !== code));
      }
    } catch (err) {
      console.error('Failed to delete meeting:', err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' at ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row">
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 min-h-screen flex flex-col">
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          
          {/* Header Banner */}
          <div className="saas-card p-8 sm:p-10 rounded-3xl relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-4">
                SaaS Dashboard
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Welcome back, <span className="text-indigo-400">{user?.name}</span> 👋
              </h1>
              <p className="text-slate-400 text-sm sm:text-base mt-2 leading-relaxed">
                Ready to connect with your team? Launch an instant video room or join an ongoing conference.
              </p>

              {/* Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="p-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-left shadow-xl shadow-indigo-600/25 transition-all group flex flex-col justify-between"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                    <Plus className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-200" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Create Meeting</h3>
                    <p className="text-xs text-indigo-100/80 mt-1">Start a new video room instantly.</p>
                  </div>
                </button>

                <button
                  onClick={() => setIsJoinOpen(true)}
                  className="p-5 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 text-slate-100 font-semibold text-left border border-slate-800 transition-all group flex flex-col justify-between"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4">
                    <LogIn className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Join Meeting</h3>
                    <p className="text-xs text-slate-400 mt-1">Enter a meeting code and join.</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Real Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="saas-card p-6 rounded-2xl flex items-center gap-4 border border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Hosted Meetings</p>
                <h3 className="text-2xl font-extrabold text-white">{meetings.length}</h3>
              </div>
            </div>

            <div className="saas-card p-6 rounded-2xl flex items-center gap-4 border border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">WebRTC Engine</p>
                <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  Socket.io Connected
                </h3>
              </div>
            </div>

            <div className="saas-card p-6 rounded-2xl flex items-center gap-4 border border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Security</p>
                <h3 className="text-sm font-bold text-slate-200">JWT & Bcrypt Active</h3>
              </div>
            </div>
          </div>

          {/* Recent Meetings Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <span>Recent Meetings</span>
              </h2>
            </div>

            {loading ? (
              <div className="py-12 saas-card rounded-2xl flex items-center justify-center border border-slate-800">
                <LoadingSpinner size="md" text="Fetching your meetings..." />
              </div>
            ) : meetings.length === 0 ? (
              <div className="py-12 saas-card rounded-2xl text-center p-8 border border-slate-800">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-200">No meetings yet</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                  Create your first meeting to get started with ConnectMeet.
                </p>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all"
                >
                  Create Your First Meeting
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {meetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="saas-card saas-card-hover p-6 rounded-2xl border border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                          {meeting.meeting_code}
                        </span>
                        <button
                          onClick={() => handleDeleteMeeting(meeting.meeting_code)}
                          className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 transition-all"
                          title="Delete Meeting"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h3 className="text-base font-bold text-slate-100 mb-1 line-clamp-1">{meeting.title}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{formatDate(meeting.created_at)}</span>
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/meeting/${meeting.meeting_code}`)}
                        className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Join Room</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleCopyLink(meeting.meeting_code)}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-800"
                        title="Copy Link"
                      >
                        {copiedCode === meeting.meeting_code ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <CreateMeetingModal isOpen={isCreateOpen} onClose={() => { setIsCreateOpen(false); fetchMeetings(); }} />
      <JoinMeetingModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
    </div>
  );
};

export default DashboardPage;
