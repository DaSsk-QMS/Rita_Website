import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

// `v` (token version) lets us revoke every session of a user by incrementing
// user.tokenVersion — e.g. after a password change or "log out everywhere".
export const signToken = (user, remember = true) =>
  jwt.sign({ id: user._id, role: user.role, v: user.tokenVersion || 0 }, process.env.JWT_SECRET, {
    expiresIn: remember ? process.env.JWT_EXPIRES_IN || '7d' : '12h',
  });

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Not authorised' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.active) return res.status(401).json({ message: 'Account not available' });
    if ((decoded.v || 0) !== (user.tokenVersion || 0)) return res.status(401).json({ message: 'Session was signed out. Please log in again.' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Session expired, please log in again' });
  }
}

export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user?.role)) return res.status(403).json({ message: 'Permission denied' });
    next();
  };
