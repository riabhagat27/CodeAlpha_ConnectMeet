import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Check, Users, Video, ShieldCheck, AlertCircle, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useWebRTC } from '../hooks/useWebRTC';
import { meetingService } from '../services/api';

import VideoGrid from '../components/VideoGrid';
import MeetingControls from '../components/MeetingControls';
import ChatPanel from '../components/ChatPanel';
import FilePanel from '../components/FilePanel';
import Whiteboard from '../components/Whiteboard';
import ParticipantPanel from '../components/ParticipantPanel';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

const MeetingRoomPage = () => {
  const { meetingCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active side panel: null | 'chat' | 'files' | 'whiteboard' | 'participants'
  const [activePanel, setActivePanel] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isConfirmLeaveOpen, setIsConfirmLeaveOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch meeting metadata
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const res = await meetingService.getMeetingByCode(meetingCode);
        if (res.success && res.data) {
          setMeeting(res.data);
        }
      } catch (err) {
        console.error('Error loading meeting room:', err);
        setError(err.response?.data?.message || 'Meeting room not found.');
      } finally {
        setLoading(false);
      }
    };

    if (meetingCode) {
      fetchRoom();
    }
  }, [meetingCode]);

  const isHost = meeting ? meeting.host_id === user?.id : false;

  // WebRTC Hook initialization
  const {
    localStream,
    remoteStreams,
    micEnabled,
    cameraEnabled,
    isScreenSharing,
    mediaError,
    participants,
    toggleMicrophone,
    toggleCamera,
    toggleScreenShare
  } = useWebRTC(socket, meetingCode, user, isHost);

  // Unread messages counter handler & room exit
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (activePanel !== 'chat' && msg.senderId !== user?.id) {
        setUnreadMessages((prev) => prev + 1);
      }
    };

    const handleMeetingEnded = () => {
      setToastMessage({ type: 'info', message: 'The host has ended this meeting room.' });
      setTimeout(() => navigate('/dashboard'), 2000);
    };

    socket.on('receive-chat-message', handleNewMessage);
    socket.on('meeting-ended', handleMeetingEnded);

    return () => {
      socket.off('receive-chat-message', handleNewMessage);
      socket.off('meeting-ended', handleMeetingEnded);
    };
  }, [socket, activePanel, user, navigate]);

  const handleTogglePanel = (panelName) => {
    if (activePanel === panelName) {
      setActivePanel(null);
    } else {
      setActivePanel(panelName);
      if (panelName === 'chat') {
        setUnreadMessages(0);
      }
    }
  };

  const handleCopyLink = () => {
    const meetingUrl = `${window.location.origin}/meeting/${meetingCode}`;
    navigator.clipboard.writeText(meetingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleLeaveMeeting = () => {
    if (socket) {
      socket.emit('leave-room');
    }
    navigate('/dashboard');
  };

  const handleEndMeetingForAll = () => {
    if (socket && isHost) {
      socket.emit('host-end-meeting', { meetingCode });
    }
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Connecting to ConnectMeet room..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full saas-card p-8 rounded-3xl text-center border border-slate-800">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white">Cannot Join Meeting</h2>
          <p className="text-sm text-slate-400 mt-2">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-6 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const totalParticipantCount = 1 + remoteStreams.length;

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col overflow-hidden relative selection:bg-indigo-500">
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {mediaError && (
        <Toast
          message={mediaError}
          type="error"
          duration={6000}
        />
      )}

      {/* Top Header Bar */}
      <header className="h-14 px-4 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between shrink-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <Video className="w-4 h-4" />
            </div>
            <h1 className="font-bold text-slate-100 text-sm sm:text-base max-w-[180px] sm:max-w-xs truncate">
              {meeting?.title || 'ConnectMeet Room'}
            </h1>
          </div>

          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800">
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800/60">
              {meetingCode}
            </span>
            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Copy Invitation Link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>WebRTC Active</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>{totalParticipantCount}</span>
          </div>

          {isHost && (
            <button
              onClick={() => setIsConfirmLeaveOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-semibold border border-rose-800/80 transition-colors hidden sm:inline-block"
            >
              End for All
            </button>
          )}

          <button
            onClick={() => setIsConfirmLeaveOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-all sm:hidden"
          >
            Leave
          </button>
        </div>
      </header>

      {/* Main Grid + Side Drawer Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Video Grid Section */}
        <div className="flex-1 h-full overflow-hidden flex flex-col items-center justify-center pb-20">
          <VideoGrid
            localStream={localStream}
            localUser={user}
            remoteStreams={remoteStreams}
            isHost={isHost}
            micEnabled={micEnabled}
            cameraEnabled={cameraEnabled}
            isScreenSharing={isScreenSharing}
          />
        </div>

        {/* Side Panel Drawers */}
        {activePanel && (
          <aside className="w-full sm:w-96 h-[calc(100vh-56px)] absolute sm:relative right-0 top-0 z-30 shadow-2xl transition-all animate-in slide-in-from-right duration-200">
            {activePanel === 'chat' && (
              <ChatPanel
                meetingCode={meetingCode}
                socket={socket}
                currentUser={user}
                onClose={() => setActivePanel(null)}
              />
            )}

            {activePanel === 'files' && (
              <FilePanel
                meetingId={meeting?.id}
                meetingCode={meetingCode}
                socket={socket}
                currentUser={user}
                onClose={() => setActivePanel(null)}
              />
            )}

            {activePanel === 'whiteboard' && (
              <Whiteboard
                meetingCode={meetingCode}
                socket={socket}
                onClose={() => setActivePanel(null)}
              />
            )}

            {activePanel === 'participants' && (
              <ParticipantPanel
                participants={participants}
                currentUser={user}
                localMicEnabled={micEnabled}
                localCameraEnabled={cameraEnabled}
                isHost={isHost}
                onClose={() => setActivePanel(null)}
              />
            )}
          </aside>
        )}
      </div>

      {/* Floating Bottom Toolbar Controls */}
      <MeetingControls
        micEnabled={micEnabled}
        cameraEnabled={cameraEnabled}
        isScreenSharing={isScreenSharing}
        activePanel={activePanel}
        unreadMessagesCount={unreadMessages}
        participantCount={totalParticipantCount}
        onToggleMic={toggleMicrophone}
        onToggleCamera={toggleCamera}
        onToggleScreenShare={toggleScreenShare}
        onTogglePanel={handleTogglePanel}
        onLeaveMeeting={() => setIsConfirmLeaveOpen(true)}
      />

      {/* Confirm Leave Modal */}
      <ConfirmDialog
        isOpen={isConfirmLeaveOpen}
        title={isHost ? 'Leave or End Meeting?' : 'Leave Meeting?'}
        message={
          isHost
            ? 'As host, you can end the meeting room for everyone or simply leave.'
            : 'Are you sure you want to leave this video conference?'
        }
        confirmText={isHost ? 'End Meeting for All' : 'Leave Room'}
        cancelText="Stay in Room"
        isDanger={true}
        onConfirm={isHost ? handleEndMeetingForAll : handleLeaveMeeting}
        onCancel={() => setIsConfirmLeaveOpen(false)}
      />
    </div>
  );
};

export default MeetingRoomPage;
