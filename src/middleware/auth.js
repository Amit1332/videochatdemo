import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
const authHeader = req.headers.authorization;
if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing token' });
const token = authHeader.split(' ')[1];
try {
const payload = jwt.verify(token, process.env.JWT_SECRET);
req.userId = payload.userId;
next();
} catch (e) {
return res.status(401).json({ message: 'Invalid token' });
}
}