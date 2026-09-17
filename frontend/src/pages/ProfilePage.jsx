import React from 'react';
import { User, Mail, Calendar, ShieldCheck, LogOut, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString([], {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row">
      <Sidebar />

      <main className="flex-1 lg:pl-64 min-h-screen flex flex-col">
        <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Account Profile</h1>
            <p className="text-xs text-slate-400 mt-1">Manage your account credentials and application security</p>
          </div>

          <div className="saas-card p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-slate-800 text-center sm:text-left">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-extrabold text-2xl flex items-center justify-center shadow-xl ring-4 ring-slate-900 shrink-0">
                {user?.name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div className="overflow-hidden">
                <h2 className="text-2xl font-extrabold text-white">{user?.name}</h2>
                <p className="text-sm text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span>{user?.email}</span>
                </p>
              </div>
            </div>

            <div className="py-8 space-y-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Security & Profile Details</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <p className="text-xs text-slate-400 font-semibold mb-1">Full Name</p>
                  <p className="text-sm font-bold text-slate-100">{user?.name}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <p className="text-xs text-slate-400 font-semibold mb-1">Email Address</p>
                  <p className="text-sm font-bold text-slate-100">{user?.email}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <p className="text-xs text-slate-400 font-semibold mb-1">Member Since</p>
                  <p className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span>{formatDate(user?.created_at)}</span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <p className="text-xs text-slate-400 font-semibold mb-1">Security Status</p>
                  <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>JWT Stateless Token & Bcrypt Hashed</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-end">
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-semibold text-xs border border-rose-800/80 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of ConnectMeet</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
