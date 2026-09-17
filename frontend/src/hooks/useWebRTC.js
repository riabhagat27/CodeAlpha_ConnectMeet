import { useEffect, useRef, useState, useCallback } from 'react';

// Standard public STUN configuration for WebRTC ICE discovery
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

/**
 * Custom WebRTC Hook for Multi-User Mesh Topology
 * Each participant connects directly to every other participant via RTCPeerConnection.
 */
export const useWebRTC = (socket, meetingCode, currentUser, isHost) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]); // [{ socketId, userId, name, stream, micEnabled, cameraEnabled, isScreenSharing }]
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [mediaError, setMediaError] = useState(null);
  const [participants, setParticipants] = useState([]);

  const peersRef = useRef({}); // { [socketId]: RTCPeerConnection }
  const localStreamRef = useRef(null);
  const screenTrackRef = useRef(null);

  /**
   * Helper: Initialize local audio/video media stream
   */
  const initLocalStream = async () => {
    try {
      setMediaError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.warn('[WebRTC] Error acquiring media devices:', err);
      let msg = 'Could not access camera/microphone.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera or microphone permission was denied by browser.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera or microphone device found on system.';
      }
      setMediaError(msg);

      // Create a dummy audio stream if video fails so participant can still join
      try {
        const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = audioOnlyStream;
        setLocalStream(audioOnlyStream);
        setCameraEnabled(false);
        return audioOnlyStream;
      } catch (audioErr) {
        console.error('[WebRTC] Fallback audio only also failed:', audioErr);
        return null;
      }
    }
  };

  /**
   * Create Peer Connection for a remote user socket
   */
  const createPeerConnection = useCallback((targetSocketId, targetUser) => {
    if (peersRef.current[targetSocketId]) {
      return peersRef.current[targetSocketId];
    }

    console.log(`[WebRTC] Creating RTCPeerConnection for target ${targetSocketId}`);
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peersRef.current[targetSocketId] = pc;

    // Attach local stream tracks to connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Handle ICE Candidates routing to remote peer
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc-ice-candidate', {
          targetSocketId,
          candidate: event.candidate
        });
      }
    };

    // Handle receiving remote media stream
    pc.ontrack = (event) => {
      console.log(`[WebRTC] Received remote track from ${targetSocketId}:`, event.track.kind);
      const remoteStream = event.streams[0];

      setRemoteStreams((prev) => {
        const existingIndex = prev.findIndex((s) => s.socketId === targetSocketId);
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            stream: remoteStream
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              socketId: targetSocketId,
              userId: targetUser?.userId || targetUser?.id,
              name: targetUser?.name || 'Participant',
              stream: remoteStream,
              micEnabled: targetUser?.micEnabled ?? true,
              cameraEnabled: targetUser?.cameraEnabled ?? true,
              isScreenSharing: targetUser?.isScreenSharing ?? false
            }
          ];
        }
      });
    };

    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Peer ${targetSocketId} connection state: ${pc.connectionState}`);
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected' || pc.connectionState === 'closed') {
        removePeer(targetSocketId);
      }
    };

    return pc;
  }, [socket]);

  /**
   * Remove peer connection and cleanup stream
   */
  const removePeer = useCallback((socketId) => {
    if (peersRef.current[socketId]) {
      peersRef.current[socketId].close();
      delete peersRef.current[socketId];
    }
    setRemoteStreams((prev) => prev.filter((item) => item.socketId !== socketId));
  }, []);

  /**
   * Connect and Setup Socket Signaling Listeners
   */
  useEffect(() => {
    if (!socket || !meetingCode || !currentUser) return;

    let isMounted = true;

    initLocalStream().then(() => {
      if (!isMounted) return;

      // Notify socket server of room join
      socket.emit('join-room', {
        meetingCode,
        user: currentUser,
        isHost
      });
    });

    // Event: Existing participants list received
    const handleAllParticipants = ({ participants: existingList, roomParticipants }) => {
      console.log('[WebRTC] Existing participants in room:', existingList);
      setParticipants(roomParticipants || []);

      existingList.forEach(async (participant) => {
        const pc = createPeerConnection(participant.socketId, participant);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          socket.emit('webrtc-offer', {
            targetSocketId: participant.socketId,
            offer,
            sender: currentUser
          });
        } catch (err) {
          console.error('[WebRTC] Error creating offer for existing participant:', err);
        }
      });
    };

    // Event: New user joined room
    const handleUserJoined = ({ participant, roomParticipants }) => {
      console.log('[WebRTC] User joined room:', participant);
      setParticipants(roomParticipants || []);
      // Peer connection will be initialized when offer arrives or upon signal
      createPeerConnection(participant.socketId, participant);
    };

    // Event: Incoming WebRTC Offer
    const handleOffer = async ({ offer, senderSocketId, sender }) => {
      console.log('[WebRTC] Handling offer from:', senderSocketId);
      const pc = createPeerConnection(senderSocketId, sender);

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('webrtc-answer', {
          targetSocketId: senderSocketId,
          answer
        });
      } catch (err) {
        console.error('[WebRTC] Error responding to offer:', err);
      }
    };

    // Event: Incoming WebRTC Answer
    const handleAnswer = async ({ answer, senderSocketId }) => {
      console.log('[WebRTC] Handling answer from:', senderSocketId);
      const pc = peersRef.current[senderSocketId];
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error('[WebRTC] Error setting remote description from answer:', err);
        }
      }
    };

    // Event: Incoming ICE Candidate
    const handleIceCandidate = async ({ candidate, senderSocketId }) => {
      const pc = peersRef.current[senderSocketId];
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('[WebRTC] Error adding ICE candidate:', err);
        }
      }
    };

    // Event: Participant Left
    const handleUserLeft = ({ socketId, roomParticipants }) => {
      console.log('[WebRTC] Participant left:', socketId);
      setParticipants(roomParticipants || []);
      removePeer(socketId);
    };

    // Event: Media Status Changed
    const handleStatusChanged = ({ socketId, micEnabled: remoteMic, cameraEnabled: remoteCam, isScreenSharing: remoteScreen, roomParticipants }) => {
      setParticipants(roomParticipants || []);
      setRemoteStreams((prev) =>
        prev.map((item) => {
          if (item.socketId === socketId) {
            return {
              ...item,
              micEnabled: remoteMic !== undefined ? remoteMic : item.micEnabled,
              cameraEnabled: remoteCam !== undefined ? remoteCam : item.cameraEnabled,
              isScreenSharing: remoteScreen !== undefined ? remoteScreen : item.isScreenSharing
            };
          }
          return item;
        })
      );
    };

    socket.on('all-participants', handleAllParticipants);
    socket.on('user-joined', handleUserJoined);
    socket.on('webrtc-offer', handleOffer);
    socket.on('webrtc-answer', handleAnswer);
    socket.on('webrtc-ice-candidate', handleIceCandidate);
    socket.on('user-left', handleUserLeft);
    socket.on('participant-status-changed', handleStatusChanged);

    return () => {
      isMounted = false;
      socket.off('all-participants', handleAllParticipants);
      socket.off('user-joined', handleUserJoined);
      socket.off('webrtc-offer', handleOffer);
      socket.off('webrtc-answer', handleAnswer);
      socket.off('webrtc-ice-candidate', handleIceCandidate);
      socket.off('user-left', handleUserLeft);
      socket.off('participant-status-changed', handleStatusChanged);

      // Cleanup peers & stream tracks
      Object.keys(peersRef.current).forEach(removePeer);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [socket, meetingCode, currentUser, isHost, createPeerConnection, removePeer]);

  /**
   * Toggle Microphone Audio Track
   */
  const toggleMicrophone = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        const newStatus = audioTrack.enabled;
        setMicEnabled(newStatus);

        if (socket) {
          socket.emit('update-media-status', {
            meetingCode,
            micEnabled: newStatus
          });
        }
      }
    }
  };

  /**
   * Toggle Camera Video Track
   */
  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        const newStatus = videoTrack.enabled;
        setCameraEnabled(newStatus);

        if (socket) {
          socket.emit('update-media-status', {
            meetingCode,
            cameraEnabled: newStatus
          });
        }
      }
    }
  };

  /**
   * Toggle Screen Sharing Media Stream
   */
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop Screen Share & Restore Camera Video
      stopScreenShare();
      return;
    }

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false
      });

      const screenTrack = displayStream.getVideoTracks()[0];
      screenTrackRef.current = screenTrack;

      // Replace video track across all active RTCPeerConnections
      Object.values(peersRef.current).forEach((pc) => {
        const senders = pc.getSenders();
        const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
        if (videoSender) {
          videoSender.replaceTrack(screenTrack);
        }
      });

      setIsScreenSharing(true);
      if (socket) {
        socket.emit('update-media-status', {
          meetingCode,
          isScreenSharing: true
        });
      }

      // Handle when user stops sharing via browser banner button
      screenTrack.onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.warn('[WebRTC] Screen sharing cancelled or error:', err);
    }
  };

  const stopScreenShare = () => {
    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
      screenTrackRef.current = null;
    }

    const cameraVideoTrack = localStreamRef.current ? localStreamRef.current.getVideoTracks()[0] : null;

    // Restore camera video track in all active RTCPeerConnections
    Object.values(peersRef.current).forEach((pc) => {
      const senders = pc.getSenders();
      const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
      if (videoSender && cameraVideoTrack) {
        videoSender.replaceTrack(cameraVideoTrack);
      }
    });

    setIsScreenSharing(false);
    if (socket) {
      socket.emit('update-media-status', {
        meetingCode,
        isScreenSharing: false
      });
    }
  };

  return {
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
  };
};
