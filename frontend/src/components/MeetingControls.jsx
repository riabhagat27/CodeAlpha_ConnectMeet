import React from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MessageSquare,
  Folder,
  PenTool,
  Users,
  PhoneOff
} from 'lucide-react';

const MeetingControls = ({
  micEnabled,
  cameraEnabled,
  isScreenSharing,
  activePanel, // 'chat' | 'files' | 'whiteboard' | 'participants' | null
  unreadMessagesCount = 0,
  participantCount = 1,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onTogglePanel,
  onLeaveMeeting
}) => {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2.5 rounded-2xl glass-panel shadow-2xl flex items-center gap-2 sm:gap-3 border border-slate-800/80">
      {/* Microphone Control */}
      <button
        onClick={onToggleMic}
        aria-label={micEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
        title={micEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
        className={`p-3 rounded-xl transition-all font-medium flex items-center justify-center ${
          micEnabled
            ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
            : 'bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-600/30'
        }`}
      >
        {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
      </button>

      {/* Camera Control */}
      <button
        onClick={onToggleCamera}
        aria-label={cameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
        title={cameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
        className={`p-3 rounded-xl transition-all font-medium flex items-center justify-center ${
          cameraEnabled
            ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
            : 'bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-600/30'
        }`}
      >
        {cameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
      </button>

      {/* Screen Share Control */}
      <button
        onClick={onToggleScreenShare}
        aria-label={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen'}
        title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen'}
        className={`p-3 rounded-xl transition-all font-medium flex items-center justify-center ${
          isScreenSharing
            ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400'
            : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
        }`}
      >
        <Monitor className="w-5 h-5" />
      </button>

      <div className="w-px h-6 bg-slate-800 my-auto hidden sm:block" />

      {/* Chat Panel Toggle */}
      <button
        onClick={() => onTogglePanel('chat')}
        aria-label="Toggle Chat Panel"
        title="Chat"
        className={`relative p-3 rounded-xl transition-all font-medium flex items-center justify-center ${
          activePanel === 'chat'
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
            : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
        }`}
      >
        <MessageSquare className="w-5 h-5" />
        {unreadMessagesCount > 0 && activePanel !== 'chat' && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-slate-950">
            {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
          </span>
        )}
      </button>

      {/* Whiteboard Toggle */}
      <button
        onClick={() => onTogglePanel('whiteboard')}
        aria-label="Toggle Collaborative Whiteboard"
        title="Whiteboard"
        className={`p-3 rounded-xl transition-all font-medium flex items-center justify-center ${
          activePanel === 'whiteboard'
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
            : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
        }`}
      >
        <PenTool className="w-5 h-5" />
      </button>

      {/* Files Panel Toggle */}
      <button
        onClick={() => onTogglePanel('files')}
        aria-label="Toggle File Sharing Panel"
        title="Shared Files"
        className={`p-3 rounded-xl transition-all font-medium flex items-center justify-center ${
          activePanel === 'files'
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
            : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
        }`}
      >
        <Folder className="w-5 h-5" />
      </button>

      {/* Participants Panel Toggle */}
      <button
        onClick={() => onTogglePanel('participants')}
        aria-label="Toggle Participants List"
        title="Participants"
        className={`relative p-3 rounded-xl transition-all font-medium flex items-center justify-center ${
          activePanel === 'participants'
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
            : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
        }`}
      >
        <Users className="w-5 h-5" />
        {participantCount > 0 && (
          <span className="ml-1.5 px-1.5 py-0.5 text-xs font-bold bg-slate-700 text-slate-200 rounded-full hidden sm:inline-block">
            {participantCount}
          </span>
        )}
      </button>

      <div className="w-px h-6 bg-slate-800 my-auto hidden sm:block" />

      {/* Leave Meeting Button */}
      <button
        onClick={onLeaveMeeting}
        aria-label="Leave Meeting"
        title="Leave Meeting"
        className="px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
      >
        <PhoneOff className="w-5 h-5" />
        <span className="hidden md:inline text-sm">Leave</span>
      </button>
    </div>
  );
};

export default MeetingControls;
