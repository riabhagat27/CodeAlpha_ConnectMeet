import React, { useEffect, useRef } from 'react';
import { MicOff, Crown, Monitor, User } from 'lucide-react';

const VideoCard = ({
  stream,
  name = 'Participant',
  isLocal = false,
  isHost = false,
  micEnabled = true,
  cameraEnabled = true,
  isScreenSharing = false
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const getInitials = (str) => {
    if (!str) return 'U';
    return str
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative group w-full h-full min-h-[220px] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-center">
      {/* Video Element */}
      {cameraEnabled && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Local video muted to avoid audio echo feedback
          className={`w-full h-full object-cover ${
            isLocal && !isScreenSharing ? 'scale-x-[-1]' : ''
          }`}
        />
      ) : (
        /* Camera Off Fallback Avatar */
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-slate-800">
            {getInitials(name)}
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-300 max-w-[160px] truncate">{name}</p>
          <span className="mt-1 text-xs text-slate-500 font-medium">Camera Off</span>
        </div>
      )}

      {/* Top Left Badges */}
      <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
        {isHost && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
            <Crown className="w-3 h-3 text-amber-400" />
            <span>Host</span>
          </span>
        )}

        {isScreenSharing && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
            <Monitor className="w-3 h-3 text-indigo-400" />
            <span>Screen</span>
          </span>
        )}
      </div>

      {/* Bottom Information Overlay */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800/80 text-white max-w-[80%]">
          <span className="text-xs font-semibold truncate">
            {name} {isLocal && '(You)'}
          </span>
        </div>

        {/* Mic Status Indicator */}
        {!micEnabled && (
          <div className="p-1.5 rounded-lg bg-rose-950/90 border border-rose-800/80 text-rose-300 backdrop-blur-md">
            <MicOff className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCard;
