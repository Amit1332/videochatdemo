import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function generateToken(userId) {
return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export async function signup(req, res) {
try {
const { name, email, password } = req.body;
if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
const existing = await User.findOne({ email });
if (existing) return res.status(409).json({ message: 'Email already in use' });
const passwordHash = await bcrypt.hash(password, 10);
const user = await User.create({ name, email, passwordHash });
const token = generateToken(user._id.toString());
return res.status(201).json({ token, user: user.toSafeJSON() });
} catch (err) {
console.error(err);
return res.status(500).json({ message: 'Server error' });
}
}

export async function login(req, res) {
try {
const { email, password } = req.body;
if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
const user = await User.findOne({ email });
if (!user) return res.status(401).json({ message: 'Invalid credentials' });
const ok = await bcrypt.compare(password, user.passwordHash);
if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
const token = generateToken(user._id.toString());
return res.json({ token, user: user.toSafeJSON() });
} catch (err) {
console.error(err);
return res.status(500).json({ message: 'Server error' });
}
}

export async function me(req, res) {
try {
const user = await User.findById(req.userId);
if (!user) return res.status(404).json({ message: 'Not found' });
return res.json({ user: user.toSafeJSON() });
} catch (err) {
console.error(err);
return res.status(500).json({ message: 'Server error' });
}
}