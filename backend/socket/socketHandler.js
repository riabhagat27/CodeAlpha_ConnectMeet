/**
 * Socket.io Handler for ConnectMeet
 * Handles real-time WebRTC signaling, Chat, Whiteboard, and Participant state sync.
 */

// In-memory active room participants registry
// Structure: { [meetingCode]: [ { socketId, userId, name, isHost, micEnabled, cameraEnabled, isScreenSharing } ] }
const activeRooms = {};

function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket.io] New client connected: ${socket.id}`);

    let currentMeetingCode = null;
    let currentUser = null;

    /**
     * 1. JOIN ROOM
     * Participant joins a meeting room by meeting code.
     */
    socket.on('join-room', ({ meetingCode, user, isHost = false }) => {
      currentMeetingCode = meetingCode.toUpperCase().trim();
      currentUser = user;

      socket.join(currentMeetingCode);

      if (!activeRooms[currentMeetingCode]) {
        activeRooms[currentMeetingCode] = [];
      }

      const existingParticipantIndex = activeRooms[currentMeetingCode].findIndex(
        (p) => p.userId === user.id
      );

      const participantInfo = {
        socketId: socket.id,
        userId: user.id,
        name: user.name,
        isHost: isHost,
        micEnabled: true,
        cameraEnabled: true,
        isScreenSharing: false
      };

      if (existingParticipantIndex !== -1) {
        activeRooms[currentMeetingCode][existingParticipantIndex] = participantInfo;
      } else {
        activeRooms[currentMeetingCode].push(participantInfo);
      }

      console.log(`[Socket.io] User ${user.name} (${socket.id}) joined room ${currentMeetingCode}`);

      // Send list of existing participants in the room to the joining user
      const existingParticipants = activeRooms[currentMeetingCode].filter(
        (p) => p.socketId !== socket.id
      );
      socket.emit('all-participants', {
        participants: existingParticipants,
        roomParticipants: activeRooms[currentMeetingCode]
      });

      // Notify other participants in the room that a new user joined
      socket.to(currentMeetingCode).emit('user-joined', {
        participant: participantInfo,
        roomParticipants: activeRooms[currentMeetingCode]
      });
    });

    /**
     * 2. WEBRTC SIGNALING: OFFER
     * User sends WebRTC SDP offer to a target peer in the room.
     */
    socket.on('webrtc-offer', ({ targetSocketId, offer, sender }) => {
      console.log(`[WebRTC Signal] Offer from ${socket.id} to ${targetSocketId}`);
      io.to(targetSocketId).emit('webrtc-offer', {
        offer,
        senderSocketId: socket.id,
        sender: sender || currentUser
      });
    });

    /**
     * 3. WEBRTC SIGNALING: ANSWER
     * Target peer sends SDP answer back to offerer.
     */
    socket.on('webrtc-answer', ({ targetSocketId, answer }) => {
      console.log(`[WebRTC Signal] Answer from ${socket.id} to ${targetSocketId}`);
      io.to(targetSocketId).emit('webrtc-answer', {
        answer,
        senderSocketId: socket.id
      });
    });

    /**
     * 4. WEBRTC SIGNALING: ICE CANDIDATE
     * Peer exchanges ICE network routing candidates with target peer.
     */
    socket.on('webrtc-ice-candidate', ({ targetSocketId, candidate }) => {
      io.to(targetSocketId).emit('webrtc-ice-candidate', {
        candidate,
        senderSocketId: socket.id
      });
    });

    /**
     * 5. PARTICIPANT MEDIA STATUS UPDATES (Mic / Camera / Screen share)
     */
    socket.on('update-media-status', ({ meetingCode, micEnabled, cameraEnabled, isScreenSharing }) => {
      const code = meetingCode.toUpperCase().trim();
      if (activeRooms[code]) {
        const participant = activeRooms[code].find((p) => p.socketId === socket.id);
        if (participant) {
          if (micEnabled !== undefined) participant.micEnabled = micEnabled;
          if (cameraEnabled !== undefined) participant.cameraEnabled = cameraEnabled;
          if (isScreenSharing !== undefined) participant.isScreenSharing = isScreenSharing;
        }

        io.to(code).emit('participant-status-changed', {
          socketId: socket.id,
          userId: currentUser?.id,
          micEnabled,
          cameraEnabled,
          isScreenSharing,
          roomParticipants: activeRooms[code]
        });
      }
    });

    /**
     * 6. REAL-TIME CHAT MESSAGES
     */
    socket.on('send-chat-message', ({ meetingCode, message }) => {
      const code = meetingCode.toUpperCase().trim();
      const chatPayload = {
        id: Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        senderName: currentUser ? currentUser.name : 'Participant',
        senderId: currentUser ? currentUser.id : null,
        senderSocketId: socket.id,
        text: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      io.to(code).emit('receive-chat-message', chatPayload);
    });

    /**
     * 7. COLLABORATIVE WHITEBOARD DRAWING & CLEAR
     */
    socket.on('whiteboard-draw', ({ meetingCode, drawData }) => {
      const code = meetingCode.toUpperCase().trim();
      socket.to(code).emit('whiteboard-draw', drawData);
    });

    socket.on('whiteboard-clear', ({ meetingCode }) => {
      const code = meetingCode.toUpperCase().trim();
      socket.to(code).emit('whiteboard-clear');
    });

    /**
     * 8. FILE UPLOADED NOTIFICATION
     */
    socket.on('file-uploaded', ({ meetingCode, fileRecord }) => {
      const code = meetingCode.toUpperCase().trim();
      io.to(code).emit('file-uploaded-notification', fileRecord);
    });

    /**
     * 9. HOST END MEETING FOR ALL
     */
    socket.on('host-end-meeting', ({ meetingCode }) => {
      const code = meetingCode.toUpperCase().trim();
      io.to(code).emit('meeting-ended', { message: 'The host has ended this meeting.' });
      delete activeRooms[code];
    });

    /**
     * 10. LEAVE ROOM & DISCONNECT HANDLER
     */
    const handleLeave = () => {
      if (currentMeetingCode && activeRooms[currentMeetingCode]) {
        console.log(`[Socket.io] User ${currentUser?.name} (${socket.id}) leaving room ${currentMeetingCode}`);

        activeRooms[currentMeetingCode] = activeRooms[currentMeetingCode].filter(
          (p) => p.socketId !== socket.id
        );

        io.to(currentMeetingCode).emit('user-left', {
          socketId: socket.id,
          userId: currentUser?.id,
          name: currentUser?.name,
          roomParticipants: activeRooms[currentMeetingCode]
        });

        if (activeRooms[currentMeetingCode].length === 0) {
          delete activeRooms[currentMeetingCode];
        }

        socket.leave(currentMeetingCode);
      }
    };

    socket.on('leave-room', handleLeave);

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
      handleLeave();
    });
  });
}

module.exports = setupSocket;
