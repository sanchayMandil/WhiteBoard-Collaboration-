const express = require('express');
const { connection_db } = require('./coonection');
const verifyemial = require('./controller/mail');
const cors = require('cors');
const { saveContent, fetchBoard,createBoard, deleteBoard ,loadContent, updateContent } = require('./controller/board');
const users = require('./models/users');
const { authenticationToken,register, loginVerify } = require('./controller/user');
const http = require('http');
const { Server } = require('socket.io');
const Whiteboard = require('./models/board');
const saveIssue = require('./controller/issue');

const app = express();
const PORT = 5001;

// Create HTTP server and integrate Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

// Session management
const sessions = new Map(); // Map<whiteboardId, Map<socketId, { email, username }>>
const sessionHosts = new Map(); // Map<whiteboardId, hostEmail>
const drawingPermissions = new Map(); // Map<whiteboardId, Map<email, boolean>>

io.on('connection', (socket) => {
  const token = socket.handshake.query.token;
  const whiteboardId = socket.handshake.query.whiteboardId;

  // Validate inputs
  if (!token || !whiteboardId) {
    socket.emit('error', 'Missing token or whiteboardId');
    socket.disconnect();
    return;
  }

  // Verify JWT token
  let userEmail = null;
  let username = null;
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, 'SaaS'); // Use your secretKey
    userEmail = decoded.email;
    username = decoded.username;
  } catch (err) {
    socket.emit('error', 'Invalid token');
    socket.disconnect();
    return;
  }

  console.log(`User connected: ${userEmail} to whiteboard: ${whiteboardId}`);

  // Validate whiteboardId exists in MongoDB
  Whiteboard.findById(whiteboardId)
    .then((whiteboard) => {
      if (!whiteboard) {
        socket.emit('error', 'Invalid whiteboard ID');
        socket.disconnect();
        return;
      }

      // Join whiteboard session
      socket.join(whiteboardId);

      // Initialize session if it doesn't exist
      if (!sessions.has(whiteboardId)) {
        sessions.set(whiteboardId, new Map());
        sessionHosts.set(whiteboardId, whiteboard.creatorEmail);
        drawingPermissions.set(whiteboardId, new Map([[whiteboard.creatorEmail, true]]));
        io.to(whiteboardId).emit('hostUpdated', whiteboard.creatorEmail);
      }

      // Remove any existing entries for this user to prevent duplicates
      const userSession = sessions.get(whiteboardId);
      for (const [socketId, user] of userSession) {
        if (user.email === userEmail && socketId !== socket.id) {
          userSession.delete(socketId);
          console.log(`Removed duplicate socket ${socketId} for user: ${userEmail}`);
        }
      }

      // Add user to session
      userSession.set(socket.id, { email: userEmail, username });
      console.log(`Current participants for ${whiteboardId}:`, Array.from(userSession.values()));

      // Initialize drawing permission for new user (default: false for non-host)
      const permissions = drawingPermissions.get(whiteboardId);
      if (!permissions.has(userEmail)) {
        permissions.set(userEmail, userEmail === whiteboard.creatorEmail);
      }

      // Send participant list and permissions to the joining user
      const participants = Array.from(userSession.values());
      socket.emit('participantsUpdated', participants);
      socket.emit('permissionUpdated', { email: userEmail, canDraw: permissions.get(userEmail) });

      // Notify others of new participant
      socket.to(whiteboardId).emit('userJoined', { email: userEmail, username });

      // Send host information
      socket.emit('hostUpdated', sessionHosts.get(whiteboardId));

      // Broadcast updated participant list and permissions to all clients
      io.to(whiteboardId).emit('participantsUpdated', participants);
      participants.forEach(participant => {
        io.to(whiteboardId).emit('permissionUpdated', {
          email: participant.email,
          canDraw: permissions.get(participant.email) || false,
        });
      });
    })
    .catch((err) => {
      console.error('Error validating whiteboard:', err);
      socket.emit('error', 'Server error');
      socket.disconnect();
    });

  // Handle drawing actions
  socket.on('drawAction', (data) => {
    const permissions = drawingPermissions.get(whiteboardId);
    if (permissions.get(userEmail) || userEmail === sessionHosts.get(whiteboardId)) {
      socket.to(whiteboardId).emit('drawAction', { email: userEmail, ...data });
    } else {
      socket.emit('error', 'You do not have permission to draw');
    }
  });

  // Handle layer clearing
  socket.on('clearLayer', (layerId) => {
    if (userEmail === sessionHosts.get(whiteboardId)) {
      io.to(whiteboardId).emit('clearLayer', layerId);
    } else {
      socket.emit('error', 'Only the host can clear the layer');
    }
  });

  // Handle permission granting
  socket.on('grantPermission', ({ whiteboardId, email }) => {
    if (userEmail !== sessionHosts.get(whiteboardId)) {
      socket.emit('error', 'Only the host can grant permissions');
      return;
    }

    const permissions = drawingPermissions.get(whiteboardId);
    if (permissions) {
      permissions.set(email, true);
      io.to(whiteboardId).emit('permissionUpdated', { email, canDraw: true });
      console.log(`Granted drawing permission to ${email} for whiteboard ${whiteboardId}`);
    }
  });

  // Handle permission revoking
  socket.on('revokePermission', ({ whiteboardId, email }) => {
    if (userEmail !== sessionHosts.get(whiteboardId)) {
      socket.emit('error', 'Only the host can revoke permissions');
      return;
    }

    const permissions = drawingPermissions.get(whiteboardId);
    if (permissions) {
      permissions.set(email, false);
      io.to(whiteboardId).emit('permissionUpdated', { email, canDraw: false });
      console.log(`Revoked drawing permission from ${email} for whiteboard ${whiteboardId}`);
    }
  });

  // Handle session ending
  socket.on('endSession', ({ whiteboardId }) => {
    if (userEmail !== sessionHosts.get(whiteboardId)) {
      socket.emit('error', 'Only the host can end the session');
      return;
    }

    const userSession = sessions.get(whiteboardId);
    if (userSession) {
      // Disconnect all non-host users
      for (const [socketId, user] of userSession) {
        if (user.email !== sessionHosts.get(whiteboardId)) {
          const clientSocket = io.sockets.sockets.get(socketId);
          if (clientSocket) {
            clientSocket.emit('sessionEnded');
            clientSocket.disconnect(true);
            userSession.delete(socketId);
            console.log(`Disconnected non-host user: ${user.email} from whiteboard: ${whiteboardId}`);
          }
        }
      }

      // Update participants list (only host remains)
      const remainingParticipants = Array.from(userSession.values());
      io.to(whiteboardId).emit('participantsUpdated', remainingParticipants);

      // Clean up permissions for non-host users
      const permissions = drawingPermissions.get(whiteboardId);
      if (permissions) {
        for (const email of permissions.keys()) {
          if (email !== sessionHosts.get(whiteboardId)) {
            permissions.delete(email);
          }
        }
      }

      console.log(`Session ended for whiteboard: ${whiteboardId}`);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${userEmail} from whiteboard: ${whiteboardId}`);
    if (sessions.has(whiteboardId)) {
      sessions.get(whiteboardId).delete(socket.id);
      socket.to(whiteboardId).emit('userLeft', userEmail);

      // Update participants for remaining users
      const participants = Array.from(sessions.get(whiteboardId).values());
      console.log(`Participants after disconnect for ${whiteboardId}:`, participants);
      io.to(whiteboardId).emit('participantsUpdated', participants);

      // Clean up empty sessions
      if (sessions.get(whiteboardId).size === 0) {
        sessions.delete(whiteboardId);
        sessionHosts.delete(whiteboardId);
        drawingPermissions.delete(whiteboardId);
      }
    }
  });
});

// Existing routes
// app.get('/', (req, res) => {
//   res.json({ id: 'hi' });
// });
app.get('/board/:id', loadContent);
app.put('/board/:id', updateContent);
app.get('/dashboard', fetchBoard);
app.delete('/dashboard/delete/:boardId', deleteBoard);
app.post('/register', register);
app.post('/login', loginVerify);
app.post('/issue', saveIssue);
app.post('/board/save', saveContent);
app.get('/create', authenticationToken, createBoard);
app.post('/verify', verifyemial);

connection_db('mongodb://localhost:27017/WhiteBoard')
  .then(() => console.log('mongodb is connected'))
  .catch((error) => console.log(error));

server.listen(PORT, () => console.log('server starts: ' + PORT));