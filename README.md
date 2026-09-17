# ConnectMeet — Real-Time Video Conferencing & Team Collaboration Platform

ConnectMeet is a full-stack real-time video conferencing, screen-sharing, collaborative whiteboard, and file sharing application built for **CodeAlpha Full Stack Development Internship — Task 4**.

It delivers a modern web application experience with multi-user WebRTC video calling, Socket.io signaling, JWT authentication, SQLite storage, and a dark-mode glassmorphism interface.

---

## 🌟 Key Features

- **User Authentication**: Secure user registration, password hashing (`bcryptjs`), stateless session authorization using JSON Web Tokens (`JWT`), and protected frontend/backend routes.
- **Meeting Room Management**: Generate unique meeting codes (e.g. `ABC-123-XYZ`), create custom meeting titles, and join existing rooms via code or direct link.
- **Multi-User WebRTC Video Calling**: Peer-to-peer mesh WebRTC video & audio streams powered by Socket.io signaling.
- **Microphone & Camera Controls**: Toggle microphone audio tracks and camera video tracks with visual avatar fallback indicators.
- **Screen Sharing**: Replace local video stream with real-time screen capture (`getDisplayMedia`) and auto-restore camera video upon stopping.
- **Real-Time Synchronized Chat**: Instant in-meeting text chat with sender names, timestamps, unread badges, and auto-scroll.
- **Collaborative Canvas Whiteboard**: Real-time HTML5 Canvas drawing board with freehand brush, color palette, brush size slider, eraser, clear board, and Socket.io stroke synchronization.
- **File Sharing**: Multi-file upload (`Multer`) with security file type filtering (disallowing executables), file size limits (10MB), metadata stored in SQLite, real-time participant broadcast, and one-click downloads.
- **Participant Panel**: Real-time view of room attendees with host badges, camera states, and microphone mute/unmute indicators.
- **Host Controls**: Recognized Host badge and "End Meeting for All" capability.

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React 18 & Vite
- **Styling**: Tailwind CSS & Vanilla CSS Design Tokens (Glassmorphism Dark Theme)
- **Icons**: Lucide React
- **Routing**: React Router DOM v6
- **Real-time & Signaling**: Socket.io-client
- **Media API**: WebRTC (`RTCPeerConnection`, `getUserMedia`, `getDisplayMedia`)
- **HTTP Client**: Axios with Authorization Bearer Interceptor

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: SQLite3 (`sqlite` & `sqlite3` drivers)
- **Real-Time Engine**: Socket.io Server
- **Authentication**: JSONWebToken (`jsonwebtoken`) & `bcryptjs`
- **File Handling**: Multer middleware
- **Security**: Cors, Helmet

---

## 📁 Project Structure

```text
CodeAlpha_ConnectMeet/
├── backend/
│   ├── config/
│   │   └── database.js          # SQLite setup and table initialization
│   ├── controllers/
│   │   ├── authController.js    # Register, login, getMe logic
│   │   ├── fileController.js    # Upload, list, download file logic
│   │   └── meetingController.js # Create, get, delete meeting rooms
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT authentication guard
│   │   └── uploadMiddleware.js  # Multer file limits & safety filter
│   ├── routes/
│   │   ├── authRoutes.js        # Auth REST endpoints
│   │   ├── fileRoutes.js        # File upload & download endpoints
│   │   └── meetingRoutes.js     # Meeting REST endpoints
│   ├── socket/
│   │   └── socketHandler.js     # Socket.io WebRTC signaling & real-time events
│   ├── uploads/                 # Storage for uploaded meeting files
│   ├── server.js                # Express & Socket.io entry point
│   ├── .env.example             # Backend environment template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components (VideoGrid, Chat, Whiteboard, etc.)
│   │   ├── context/             # AuthContext & SocketContext state providers
│   │   ├── hooks/               # Custom useWebRTC hook
│   │   ├── pages/               # Page views (Login, Register, Dashboard, MeetingRoom, Profile)
│   │   ├── services/            # Axios API service
│   │   ├── App.jsx              # React router configuration
│   │   ├── index.css            # Custom CSS & Tailwind directives
│   │   └── main.jsx             # React DOM entry
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example             # Frontend environment template
│   └── package.json
├── README.md
└── .gitignore
```

---

## ⚙️ Environment Variables Setup

### Backend Environment (`backend/.env`)
Create `backend/.env` based on `backend/.env.example`:
```env
PORT=5000
JWT_SECRET=connectmeet_super_secret_jwt_key_2026_codealpha
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend Environment (`frontend/.env`)
Create `frontend/.env` based on `frontend/.env.example`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🚀 Running Locally

### 1. Clone & Setup Backend
```bash
cd backend
npm install
npm start
```
The backend server will run on `http://localhost:5000` and automatically create `connectmeet.db`.

### 2. Setup Frontend
In a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 💡 WebRTC & Socket.io Signaling Architecture

1. **Signaling Flow**:
   - Participant A joins room `ABC-123-XYZ`. Socket sends `join-room`.
   - Socket server adds Participant A to active room registry and broadcasts `user-joined`.
   - Participant B joins. Server sends `all-participants` to B.
   - Participant B creates an `RTCPeerConnection` for A, calls `createOffer()`, and emits `webrtc-offer` to A via Socket.io.
   - Participant A receives `webrtc-offer`, calls `setRemoteDescription()`, creates `createAnswer()`, and returns `webrtc-answer` to B.
   - Both peers exchange ICE candidates (`webrtc-ice-candidate`) until P2P direct media stream is established.
   - Socket server only relays SDP signals and never handles raw video data!

2. **Testing Multi-User Locally**:
   - Open standard browser window -> Register Account 1 (e.g. `Ria`) -> Create Meeting.
   - Open Incognito / Private window -> Register Account 2 (e.g. `Aarav`) -> Join Meeting Code.
   - Both windows will show live WebRTC video streams, interactive whiteboard, chat, and files!

---

## 🔒 Security Implementation

- **Bcrypt Password Hashing**: User passwords are never stored in plain text.
- **JWT Authorization**: Sensitive REST APIs require a valid Bearer JWT header.
- **File Upload Security**: Multer enforces 10MB file size ceiling and blocks executable extensions (`.exe`, `.bat`, `.cmd`, `.sh`, `.msi`).
- **Input Validation**: Sanitizes emails and mandatory input fields across registration and meeting lookup.

---

## 🚀 Deployment Guide

- **Frontend**: Ready to deploy on **Vercel** or **Netlify** (set `VITE_API_URL` and `VITE_SOCKET_URL` build variables).
- **Backend**: Ready to deploy on **Render** or **Railway** (set `PORT`, `JWT_SECRET`, `CLIENT_URL` environment variables).

---

## 🔮 Future Improvements

- Implementation of TURN servers for restrictive NAT networks.
- Selective Forwarding Unit (SFU) architecture (e.g. Mediasoup or LiveKit) for scaling to 50+ participants per room.
- Cloud object storage (AWS S3 or Cloudinary) for file attachments.
- Session recording and AI transcription.
