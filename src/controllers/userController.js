import User from '../models/User.js';
import { presenceService } from '../sockets/presence.js';

export async function listUsers(req, res) {
try {
const users = await User.find({}, { name: 1, email: 1, createdAt: 1, updatedAt: 1 });
const onlineSet = new Set(presenceService.getOnlineUserIds());
const payload = users.map(u => ({
id: u._id.toString(),
name: u.name,
email: u.email,
online: onlineSet.has(u._id.toString()),
}));
res.json({ users: payload });
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Server error' });
}
}