import React from 'react';
import { Users, Crown, Mic, MicOff, Video, VideoOff, X } from 'lucide-react';

const ParticipantPanel = ({
  participants = [],
  currentUser,
  localMicEnabled = true,
  localCameraEnabled = true,
  isHost = false,
  onClose
}) => {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 border-l border-slate-800 shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-slate-100 text-base">
            Participants ({participants.length > 0 ? participants.length : 1})
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Participant List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {participants.length === 0 ? (
          /* Local user only fallback if room list is initializing */
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                {getInitials(currentUser?.name)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-200">
                    {currentUser?.name} (You)
                  </span>
                  {isHost && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Host
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              {localMicEnabled ? (
                <Mic className="w-4 h-4 text-emerald-400" />
              ) : (
                <MicOff className="w-4 h-4 text-rose-400" />
              )}
              {localCameraEnabled ? (
                <Video className="w-4 h-4 text-indigo-400" />
              ) : (
                <VideoOff className="w-4 h-4 text-slate-500" />
              )}
            </div>
          </div>
        ) : (
          participants.map((p) => {
            const isMe = p.userId === currentUser?.id;
            return (
              <div
                key={p.socketId || p.userId}
                className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                    {getInitials(p.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-slate-200">
                        {p.name} {isMe && '(You)'}
                      </span>
                      {p.isHost && (
                        <Crown className="w-3.5 h-3.5 text-amber-400" title="Host" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {(isMe ? localMicEnabled : p.micEnabled) ? (
                    <Mic className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <MicOff className="w-4 h-4 text-rose-400" />
                  )}

                  {(isMe ? localCameraEnabled : p.cameraEnabled) ? (
                    <Video className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <VideoOff className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ParticipantPanel;
