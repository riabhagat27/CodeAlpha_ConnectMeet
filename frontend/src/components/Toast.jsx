import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!message) return null;

  const typeConfig = {
    error: {
      bg: 'bg-rose-950/90 border-rose-800 text-rose-200',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
    },
    success: {
      bg: 'bg-emerald-950/90 border-emerald-800 text-emerald-200',
      icon: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
    },
    info: {
      bg: 'bg-indigo-950/90 border-indigo-800 text-indigo-200',
      icon: <Info className="w-5 h-5 text-indigo-400 shrink-0" />
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300 max-w-md ${config.bg}`}>
      {config.icon}
      <p className="text-sm font-medium leading-snug">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Toast;
