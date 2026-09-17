# ConnectMeet – Real-Time Communication App

ConnectMeet is a full-stack real-time communication and collaboration platform developed as **CodeAlpha Full Stack Development Internship – Task 4**.

It provides users with a virtual meeting environment featuring video conferencing, screen sharing, real-time chat, collaborative whiteboarding, and file sharing.

---

## 🚀 Live Demo

- **Frontend**: [https://code-alpha-connect-meet.vercel.app/](https://code-alpha-connect-meet.vercel.app/)
- **Backend API**: [https://codealpha-connectmeet.onrender.com/](https://codealpha-connectmeet.onrender.com/)

The frontend is deployed on **Vercel** and the backend is deployed on **Render**.

---

## ✨ Features

### 🔐 User Authentication
- User registration and login
- Secure password hashing using `bcryptjs`
- JWT-based authentication
- Protected routes and API endpoints

### 🎥 Real-Time Video Conferencing
- Multi-user video calling using WebRTC
- Real-time signaling using Socket.io
- Camera on/off toggle
- Microphone mute/unmute toggle
- Participant video display
- Avatar fallback when camera is disabled

### 🖥️ Screen Sharing
- Share your screen with other participants
- Start and stop screen sharing
- Automatically restores the camera stream after screen sharing stops

### 💬 Real-Time Chat
- Instant messaging inside meetings
- Sender names and timestamps
- Real-time message delivery using Socket.io
- Auto-scrolling chat
- Unread message indication badge

### 🎨 Collaborative Whiteboard
- Real-time collaborative drawing
- Freehand brush
- Color selection palette
- Adjustable brush size
- Eraser tool
- Clear whiteboard option
- Real-time stroke synchronization across participants

### 📁 File Sharing
- Upload files during meetings
- Real-time file availability notifications
- Direct file download support
- File metadata storage in SQLite
- Maximum file-size validation (10MB)
- Restriction of potentially executable files

### 👥 Meeting & Participant Management
- Create meeting rooms with unique generated codes
- Join meetings using meeting IDs
- Participant list with live status indicators
- Host controls
- End meeting for all participants

### 🛡️ Security
- JWT authentication
- bcrypt password hashing
- Protected API routes
- Helmet security middleware
- CORS configuration for allowed origins
- Input and file-upload validation

---

## 🛠️ Tech Stack

### Frontend
- **React.js**
- **Vite**
- **JavaScript**
- **Tailwind CSS**
- **React Router**
- **Axios**
- **Socket.io Client**
- **Lucide React**
- **WebRTC**
- **HTML5 Canvas**

### Backend
- **Node.js**
- **Express.js**
- **Socket.io**
- **SQLite**
- **JWT (`jsonwebtoken`)**
- **bcryptjs**
- **Multer**
- **Helmet**
- **CORS**
- **dotenv**

---

## 📂 Project Structure

```text
CodeAlpha_ConnectMeet/
│
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── fileController.js
│   │   └── meetingController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── fileRoutes.js
│   │   └── meetingRoutes.js
│   ├── socket/
│   │   └── socketHandler.js
│   ├── uploads/
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## ⚙️ Environment Variables

### Backend
Create a `.env` file inside the `backend` folder:
```env
PORT=5000
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```
*For production, `CLIENT_URL` should contain the deployed frontend URL.*

### Frontend
Create a `.env` file inside the `frontend` folder:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```
*For production, these should point to the deployed Render backend URL.*

*Never commit actual `.env` files or secrets to GitHub.*

---

## 💻 Local Installation

### 1. Clone the repository
```bash
git clone https://github.com/riabhagat27/CodeAlpha_ConnectMeet.git
cd CodeAlpha_ConnectMeet
```

### 2. Install backend dependencies & start server
```bash
cd backend
npm install
npm start
```

### 3. Install frontend dependencies & start dev server
Open another terminal:
```bash
cd frontend
npm install
npm run dev
```

The application will normally be available at `http://localhost:5173` (or `http://localhost:5174`).

---

## 🌐 Deployment

ConnectMeet is configured for deployment using:
- **Frontend**: Vercel
- **Backend**: Render

### Production URLs
- **Frontend**: [https://code-alpha-connect-meet.vercel.app/](https://code-alpha-connect-meet.vercel.app/)
- **Backend**: [https://codealpha-connectmeet.onrender.com/](https://codealpha-connectmeet.onrender.com/)

The frontend communicates with the backend through REST APIs and Socket.io.

---

## 🔄 Real-Time Architecture

```text
               ConnectMeet
         ┌───────────┴───────────┐
         │                       │
     Frontend                 Backend
      Vercel                  Render
         │                       │
         │       REST API        │
         ├──────────────────────>│
         │                       │
         │       Socket.io       │
         ├──────────────────────>│
         │                       │
         │<──── WebRTC signaling ┤
         │                       │
         └─────── WebRTC ────────┘
```

WebRTC handles peer-to-peer media communication, while Socket.io is used for signaling and real-time collaboration features such as chat and whiteboard synchronization.

---

## 🎯 CodeAlpha Internship Task

**Task**: Task 4 – Real-Time Communication App

The project demonstrates:
- Real-time communication
- WebRTC video conferencing
- Screen sharing
- Socket.io communication
- File sharing
- Collaborative whiteboard
- Authentication
- Secure backend APIs
- Full-stack application development

---

## 👩‍💻 Developer

**Ria Bhagat**  
B.Tech Computer Engineering  
AISSMS Institute of Information Technology, Pune  

- **GitHub**: [https://github.com/riabhagat27](https://github.com/riabhagat27)  
- **Project Repository**: [https://github.com/riabhagat27/CodeAlpha_ConnectMeet](https://github.com/riabhagat27/CodeAlpha_ConnectMeet)  

---

## 📌 Future Improvements

- Persistent cloud database
- Cloud-based file storage
- TURN server support for improved WebRTC connectivity
- Meeting scheduling
- Email notifications
- Advanced host controls
- Meeting recording
- Production-grade monitoring and logging

---

## 📄 License

This project was developed for educational and internship purposes as part of the **CodeAlpha Full Stack Development Internship**.
