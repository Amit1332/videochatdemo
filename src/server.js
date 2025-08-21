import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import { connectDatabase } from './config/db.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import jwt from 'jsonwebtoken';
import { presenceService } from './sockets/presence.js';
import { ExpressPeerServer } from 'peer';

const app = express();
const httpServer = http.createServer(app);

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN?.split(',').map(s => s.trim()) || ['http://localhost:5173','http://localhost:3000'];

app.use(cors({   cors: {
    origin: "*", // allow all
    methods: ["GET", "POST"]
  }, credentials: true }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

const io = new SocketIOServer(httpServer, {
cors: { origin: CLIENT_ORIGIN, methods: ['GET','POST'] },
path: '/socket.io',
});

io.use((socket, next) => {
const token = socket.handshake.auth?.token || socket.handshake.query?.token;
if (!token) return next(new Error('Unauthorized'));
try {
const payload = jwt.verify(token, process.env.JWT_SECRET);
socket.userId = payload.userId;
next();
} catch (e) {
next(new Error('Unauthorized'));
}
});

io.on('connection', (socket) => {
const userId = socket.userId;
presenceService.setOnline(userId, socket.id);
io.emit('presence:update', { userId, online: true });

socket.on('disconnect', () => {
presenceService.setOfflineBySocket(socket.id);
io.emit('presence:update', { userId, online: false });
});
});

const PEER_PATH = process.env.PEER_PATH || '/peerjs';
app.use(PEER_PATH, ExpressPeerServer(httpServer, { debug: true, path: '/', allow_discovery: true }));

const PORT = process.env.PORT || 5000;

(async () => {
try {
await connectDatabase(process.env.MONGODB_URI || 'mongodb+srv://amitsinghpatel9747:bXWwMUBhT8erDqIZ@cluster0.qacyksz.mongodb.net/videochat');
httpServer.listen(PORT, () => {
console.log(`Server listening on http://localhost:${PORT}`);
console.log(`PeerJS server on ${PEER_PATH}`);
});
} catch (err) {
console.error('Failed to start server', err);
process.exit(1);
}
})();