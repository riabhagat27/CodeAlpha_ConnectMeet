import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Video, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Zap, Users, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Login failed:', err);
      setErrorMessage(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row relative overflow-hidden">
      <Toast message={errorMessage} type="error" onClose={() => setErrorMessage('')} />

      {/* Left Branding Panel */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between relative z-10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border-r border-slate-800/60">
        <div>
          <Link to="/" className="inline-flex items-center gap-3 group mb-12">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-white block">
                Connect<span className="text-indigo-400">Meet</span>
              </span>
              <span className="text-xs text-slate-400 font-medium tracking-wide block">
                Connect. Collaborate. Communicate.
              </span>
            </div>
          </Link>

          <div className="max-w-md my-auto">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-6">
              Real-Time Collaboration Platform
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Meet, collaborate and build together.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed mb-8">
              Experience multi-user WebRTC video conferencing, real-time canvas whiteboard, instant chat, and secure file sharing in a single workspace.
            </p>

            <div className="space-y-3.5">
              <div className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>Peer-to-peer HD WebRTC video & crystal clear audio</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>Interactive collaborative HTML5 whiteboard</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>Instant encrypted file sharing and real-time chat</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800/60 text-xs text-slate-500 flex items-center justify-between">
          <span>ConnectMeet Platform</span>
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" /> JWT & Bcrypt Protected
          </span>
        </div>
      </div>

      {/* Right Login Card Panel */}
      <div className="lg:w-1/2 p-6 sm:p-12 lg:p-16 flex items-center justify-center relative z-10">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome back</h2>
            <p className="text-sm text-slate-400 mt-1">Please enter your credentials to access your account</p>
          </div>

          <div className="saas-card p-8 rounded-3xl border border-slate-800 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ria@example.com"
                    required
                    className="w-full bg-slate-900/90 text-slate-100 text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-900/90 text-slate-100 text-sm pl-10 pr-11 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-400 hover:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                  />
                  <span>Remember me for 7 days</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  'Signing In...'
                ) : (
                  <>
                    <span>Sign In to ConnectMeet</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
              <p className="text-sm text-slate-400">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                  Create One Now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
