import { Router } from 'express';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { protect, signToken } from '../middleware/auth.js';
import { audit, passwordProblem } from '../middleware/security.js';
import { asyncH } from '../utils/crud.js';
import { sendMail, layout, esc } from '../utils/email.js';
import { getSettings } from '../utils/settings.js';

const r = Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many attempts from this network. Try again in 15 minutes.' } });

// Account lockout: after MAX_FAILS wrong passwords the account is locked for LOCK_MINUTES.
const MAX_FAILS = 5;
const LOCK_MINUTES = 15;

const safeUser = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role, avatar: u.avatar, lastLogin: u.lastLogin, lastLoginIp: u.lastLoginIp });
// A dummy hash so a missing account takes the same time as a wrong password (prevents user enumeration by timing)
const DUMMY_HASH = bcrypt.hashSync(crypto.randomBytes(16).toString('hex'), 12);

r.post(
  '/login',
  loginLimiter,
  asyncH(async (req, res) => {
    const { email, password, remember = true } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password)
      return res.status(400).json({ message: 'Email and password are required' });
    const cleanEmail = email.toLowerCase().trim().slice(0, 160);
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user) {
      await bcrypt.compare(password, DUMMY_HASH);
      audit(req, 'login.failed', { email: cleanEmail, success: false, target: 'unknown account' });
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.isLocked()) {
      const mins = Math.ceil((user.lockUntil - Date.now()) / 60000);
      audit(req, 'login.blocked', { user, success: false, target: 'account locked' });
      return res.status(423).json({ message: `Account temporarily locked after too many failed attempts. Try again in ${mins} minute${mins > 1 ? 's' : ''}.`, locked: true });
    }
    if (!user.active || !(await user.matchPassword(password))) {
      user.failedLogins = (user.failedLogins || 0) + 1;
      let message = 'Invalid email or password';
      if (user.failedLogins >= MAX_FAILS) {
        user.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60000);
        user.failedLogins = 0;
        message = `Too many failed attempts. The account is locked for ${LOCK_MINUTES} minutes.`;
        audit(req, 'account.locked', { user, success: false });
      } else if (user.failedLogins >= MAX_FAILS - 2) {
        const left = MAX_FAILS - user.failedLogins;
        message = `Invalid email or password. ${left} attempt${left > 1 ? 's' : ''} left before the account is locked.`;
      }
      await user.save({ validateBeforeSave: false });
      audit(req, 'login.failed', { user, success: false });
      return res.status(401).json({ message });
    }

    user.failedLogins = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    user.lastLoginIp = (req.ip || '').replace(/^::ffff:/, '');
    await user.save({ validateBeforeSave: false });
    audit(req, 'login.success', { user });
    res.json({ token: signToken(user, remember !== false), user: safeUser(user) });
  })
);

r.get('/me', protect, (req, res) => res.json(safeUser(req.user)));

r.put(
  '/profile',
  protect,
  asyncH(async (req, res) => {
    const { name, email, avatar } = req.body;
    if (typeof name === 'string' && name.trim()) req.user.name = name.trim().slice(0, 120);
    if (typeof email === 'string' && email.trim()) req.user.email = email.trim().toLowerCase().slice(0, 160);
    if (typeof avatar === 'string') req.user.avatar = avatar.slice(0, 500);
    await req.user.save();
    audit(req, 'profile.update');
    res.json(safeUser(req.user));
  })
);

r.put(
  '/password',
  protect,
  asyncH(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(String(currentPassword || ''))))
      return res.status(400).json({ message: 'Current password is incorrect' });
    const problem = passwordProblem(newPassword);
    if (problem) return res.status(400).json({ message: problem });
    user.password = newPassword;
    user.passwordChangedAt = new Date();
    user.tokenVersion = (user.tokenVersion || 0) + 1; // sign out every other session
    await user.save();
    audit(req, 'password.change', { user });
    res.json({ message: 'Password updated. Other devices have been signed out.', token: signToken(user) });
  })
);

// Revoke all existing tokens for the current user (lost laptop, shared computer, ...)
r.post(
  '/logout-all',
  protect,
  asyncH(async (req, res) => {
    req.user.tokenVersion = (req.user.tokenVersion || 0) + 1;
    await req.user.save({ validateBeforeSave: false });
    audit(req, 'sessions.revoke');
    res.json({ message: 'Signed out of all devices', token: signToken(req.user) });
  })
);

r.post(
  '/forgot-password',
  loginLimiter,
  asyncH(async (req, res) => {
    const user = await User.findOne({ email: String(req.body.email || '').toLowerCase().trim() });
    // Always reply the same way so attackers can't discover accounts
    const reply = { message: 'If that account exists, a reset link has been sent.' };
    if (!user) return res.json(reply);
    const raw = crypto.randomBytes(32).toString('hex');
    user.resetToken = crypto.createHash('sha256').update(raw).digest('hex');
    user.resetExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    const settings = await getSettings();
    const base = (process.env.CLIENT_URL || '').split(',')[0] || settings.seo.siteUrl;
    const link = `${base}/admin/reset-password/${raw}`;
    await sendMail({
      to: user.email,
      subject: 'Reset your admin password',
      html: layout(
        settings,
        'Password reset',
        `<p>Hello ${esc(user.name)},</p><p>Click the button below to reset your password. The link is valid for 30 minutes.</p>
         <p><a href="${link}" style="display:inline-block;background:${settings.theme.primary};color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none">Reset password</a></p>
         <p style="font-size:12px;color:#667085">If you did not request this, you can ignore this email.</p>`
      ),
    });
    audit(req, 'password.reset-request', { user });
    if (process.env.NODE_ENV !== 'production') console.log('🔑 Password reset link:', link);
    res.json(reply);
  })
);

r.post(
  '/reset-password/:token',
  loginLimiter,
  asyncH(async (req, res) => {
    const hashed = crypto.createHash('sha256').update(String(req.params.token)).digest('hex');
    const user = await User.findOne({ resetToken: hashed, resetExpires: { $gt: new Date() } }).select(
      '+resetToken +resetExpires'
    );
    if (!user) return res.status(400).json({ message: 'Reset link is invalid or has expired' });
    const problem = passwordProblem(req.body.password);
    if (problem) return res.status(400).json({ message: problem });
    user.password = req.body.password;
    user.resetToken = undefined;
    user.resetExpires = undefined;
    user.failedLogins = 0;
    user.lockUntil = undefined;
    user.passwordChangedAt = new Date();
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();
    audit(req, 'password.reset', { user });
    res.json({ token: signToken(user), user: safeUser(user) });
  })
);

export default r;
