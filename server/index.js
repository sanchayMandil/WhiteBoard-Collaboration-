const express = require('express');
const { connection_db } = require('./coonection');
const verifyemial = require('./controller/mail');
const cors = require('cors');
const { saveContent, fetchBoard, createBoard, deleteBoard, loadContent, updateContent } = require('./controller/board');
const users = require('./models/users');
const { authenticationToken, register, loginVerify } = require('./controller/user');
const http = require('http');
const { Server } = require('socket.io');
const Whiteboard = require('./models/board');
const saveIssue = require('./controller/issue');

const app = express();
const PORT = 5001;

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

const sessions = new Map();
const sessionHosts = new Map();
const drawingPermissions = new Map();

io.on('connection', (socket) => {
  const token = socket.handshake.query.token;
  const whiteboardId = socket.handshake.query.whiteboardId;

  if (!token || !whiteboardId) {
    socket.emit('error', 'Missing token or whiteboardId');
    socket.disconnect();
    return;
  }

  let userEmail = null;
  let username = null;
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, 'SaaS');
    userEmail = decoded.email;
    username = decoded.username;
  } catch (err) {
    socket.emit('error', 'Invalid token');
    socket.disconnect();
    return;
  }

  console.log(`New socket connection: socketId=${socket.id}, userEmail=${userEmail}, whiteboardId=${whiteboardId}`);

  Whiteboard.findById(whiteboardId)
    .then((whiteboard) => {
      if (!whiteboard) {
        socket.emit('error', 'Invalid whiteboard ID');
        socket.disconnect();
        return;
      }

      socket.join(whiteboardId);

      if (!sessions.has(whiteboardId)) {
        sessions.set(whiteboardId, new Map());
        sessionHosts.set(whiteboardId, whiteboard.creatorEmail);
        drawingPermissions.set(whiteboardId, new Map([[whiteboard.creatorEmail, true]]));
        io.to(whiteboardId).emit('hostUpdated', whiteboard.creatorEmail);
      }

      const userSession = sessions.get(whiteboardId);
      for (const [socketId, user] of userSession) {
        if (user.email === userEmail && socketId !== socket.id) {
          userSession.delete(socketId);
          console.log(`Removed duplicate socket ${socketId} for user: ${userEmail}`);
        }
      }

      userSession.set(socket.id, { email: userEmail, username });
      console.log(`Current participants for ${whiteboardId}:`, Array.from(userSession.values()));

      const permissions = drawingPermissions.get(whiteboardId);
      if (!permissions.has(userEmail)) {
        permissions.set(userEmail, userEmail === whiteboard.creatorEmail);
        console.log(`Initialized permission for ${userEmail}: ${permissions.get(userEmail)}`);
      } else {
        console.log(`Preserved permission for ${userEmail}: ${permissions.get(userEmail)}`);
      }

      const participants = Array.from(userSession.values());
      socket.emit('participantsUpdated', participants);
      socket.emit('permissionUpdated', { email: userEmail, canDraw: permissions.get(userEmail) });
      socket.to(whiteboardId).emit('userJoined', { email: userEmail, username });
      socket.emit('hostUpdated', sessionHosts.get(whiteboardId));

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

  socket.on('drawAction', (data) => {
    const permissions = drawingPermissions.get(whiteboardId);
    if (permissions.get(userEmail) || userEmail === sessionHosts.get(whiteboardId)) {
      socket.to(whiteboardId).emit('drawAction', { email: userEmail, ...data });
    } else {
      socket.emit('error', 'You do not have permission to draw');
    }
  });

  socket.on('canvasState', (data) => {
    if (userEmail !== sessionHosts.get(whiteboardId)) {
      socket.emit('error', 'Only the host can update canvas state');
      return;
    }
    socket.to(whiteboardId).emit('canvasState', {
      stagePos: data.stagePos,
      stageScale: data.stageScale,
    });
    console.log(`Broadcasted canvas state for whiteboard ${whiteboardId}:`, data);
  });

  socket.on('clearLayer', (layerId) => {
    if (userEmail === sessionHosts.get(whiteboardId)) {
      io.to(whiteboardId).emit('clearLayer', layerId);
    } else {
      socket.emit('error', 'Only the host can clear the layer');
    }
  });

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

  socket.on('endSession', ({ whiteboardId }) => {
    if (userEmail !== sessionHosts.get(whiteboardId)) {
      socket.emit('error', 'Only the host can end the session');
      return;
    }

    const userSession = sessions.get(whiteboardId);
    if (userSession) {
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

      const remainingParticipants = Array.from(userSession.values());
      io.to(whiteboardId).emit('participantsUpdated', remainingParticipants);

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

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: socketId=${socket.id}, userEmail=${userEmail}, whiteboardId=${whiteboardId}`);
    if (sessions.has(whiteboardId)) {
      sessions.get(whiteboardId).delete(socket.id);
      socket.to(whiteboardId).emit('userLeft', userEmail);

      const participants = Array.from(sessions.get(whiteboardId).values());
      console.log(`Participants after disconnect for ${whiteboardId}:`, participants);
      io.to(whiteboardId).emit('participantsUpdated', participants);

      if (sessions.get(whiteboardId).size === 0) {
        sessions.delete(whiteboardId);
        sessionHosts.delete(whiteboardId);
        drawingPermissions.delete(whiteboardId);
      }
    }
  });
});

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