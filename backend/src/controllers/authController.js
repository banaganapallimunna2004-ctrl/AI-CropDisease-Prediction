const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { createAccessToken, createRefreshToken } = require('../utils/token');
const { sendEmail } = require('../services/emailService');
const { sendSms } = require('../services/smsService');

const OTP_TTL_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 12);

/* ──────────────────────────────────────────────
   Helpers
────────────────────────────────────────────── */

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
});

const normalizePhone = (phone) => {
  const value = String(phone || '').trim();
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  if (value.startsWith('+') && digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  return '';
};

const createOtp = () => String(crypto.randomInt(100000, 1000000));

const hashOtp = (otp) =>
  crypto
    .createHash('sha256')
    .update(`${otp}:${process.env.JWT_SECRET || 'agro-ai-otp-secret'}`)
    .digest('hex');

const sendAuthResponse = (res, user) => {
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);
  res.cookie('refreshToken', refreshToken, getCookieOptions());
  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    accessToken,
  });
};

/* ──────────────────────────────────────────────
   Email OTP HTML templates
────────────────────────────────────────────── */
const otpEmailHtml = (name, otp, type = 'login') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 0; }
    .container { max-width: 520px; margin: 40px auto; background: #1e293b; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #16a34a, #15803d); padding: 32px; text-align: center; }
    .header h1 { margin: 0; color: #fff; font-size: 24px; }
    .header p { margin: 4px 0 0; color: #bbf7d0; font-size: 14px; }
    .body { padding: 32px; }
    .otp-box { background: #0f172a; border: 2px dashed #16a34a; border-radius: 12px; text-align: center; padding: 24px; margin: 24px 0; }
    .otp-box span { display: block; font-size: 40px; font-weight: 800; letter-spacing: 10px; color: #4ade80; }
    .otp-box small { color: #94a3b8; font-size: 13px; }
    .footer { background: #0f172a; padding: 20px; text-align: center; color: #475569; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌾 Agro AI</h1>
      <p>Precision Crop Intelligence Platform</p>
    </div>
    <div class="body">
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your ${type === 'verify' ? 'email verification' : 'sign-in'} OTP code is:</p>
      <div class="otp-box">
        <span>${otp}</span>
        <small>Expires in ${OTP_TTL_MINUTES} minutes — do not share this code.</small>
      </div>
      <p style="color:#94a3b8;font-size:13px;">If you did not request this code, please ignore this email.</p>
    </div>
    <div class="footer">Agro AI • Smart Farming Platform</div>
  </div>
</body>
</html>`;

const verifyEmailHtml = (name, verifyUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 0; }
    .container { max-width: 520px; margin: 40px auto; background: #1e293b; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #16a34a, #15803d); padding: 32px; text-align: center; }
    .header h1 { margin: 0; color: #fff; font-size: 24px; }
    .btn { display: inline-block; background: #16a34a; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; margin: 24px 0; }
    .footer { background: #0f172a; padding: 20px; text-align: center; color: #475569; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>🌾 Agro AI</h1></div>
    <div style="padding:32px;">
      <p>Hi <strong>${name}</strong>,</p>
      <p>Welcome to Agro AI! Please verify your email to activate your account:</p>
      <div style="text-align:center;">
        <a href="${verifyUrl}" class="btn">✅ Verify My Account</a>
      </div>
      <p style="color:#94a3b8;font-size:13px;">Or copy this link: <br>${verifyUrl}</p>
      <p style="color:#94a3b8;font-size:13px;">This link expires in 24 hours.</p>
    </div>
    <div class="footer">Agro AI • Smart Farming Platform</div>
  </div>
</body>
</html>`;

/* ──────────────────────────────────────────────
   Controllers
────────────────────────────────────────────── */

/** POST /auth/register */
const register = async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) {
    return res.status(400).json({ message: 'Enter a valid phone number (+91XXXXXXXXXX).' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) return res.status(400).json({ message: 'Email already registered.' });

  const existingPhone = await User.findOne({ phone: normalizedPhone });
  if (existingPhone) return res.status(400).json({ message: 'Phone number already registered.' });

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const verificationToken = crypto.randomBytes(32).toString('hex');

  const user = await User.create({
    name,
    email: email.toLowerCase().trim(),
    phone: normalizedPhone,
    password: hashedPassword,
    role: role || 'Farmer',
    verificationToken,
  });

  const verifyUrl = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}`;

  try {
    await sendEmail({
      to: email,
      subject: '✅ Verify your Agro AI account',
      html: verifyEmailHtml(name, verifyUrl),
    });
  } catch (emailErr) {
    console.error('Verification email failed:', emailErr.message);
    // Don't fail registration if email fails in dev
  }

  res.status(201).json({
    message: 'Account created! Check your email to verify your account before signing in.',
    verifyUrl: process.env.NODE_ENV !== 'production' ? verifyUrl : undefined,
  });
};

/** POST /auth/login (email + password) */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) return res.status(401).json({ message: 'Invalid email or password.' });

  if (!user.verified) {
    return res.status(403).json({ message: 'Please verify your email before signing in.' });
  }

  sendAuthResponse(res, user);
};

/* ──────────────────────────────────────────────
   Email OTP Login (passwordless)
────────────────────────────────────────────── */

/** POST /auth/email/request-otp */
const requestEmailOtp = async (req, res) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  if (!email) return res.status(400).json({ message: 'Email address is required.' });

  const user = await User.findOne({ email }).select('+emailOtpHash +emailOtpExpires +emailOtpAttempts');
  if (!user) {
    // Security: don't reveal whether email exists
    return res.status(200).json({ message: 'If that email is registered, an OTP has been sent.' });
  }

  if (!user.verified) {
    return res.status(403).json({ message: 'Please verify your email first before using OTP login.' });
  }

  const otp = createOtp();
  user.emailOtpHash = hashOtp(otp);
  user.emailOtpExpires = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  user.emailOtpAttempts = 0;
  await user.save();

  try {
    await sendEmail({
      to: email,
      subject: `🔐 Your Agro AI Login OTP: ${otp}`,
      html: otpEmailHtml(user.name, otp, 'login'),
    });
  } catch (emailErr) {
    console.error('Email OTP send failed:', emailErr.message);
  }

  res.json({
    message: 'OTP sent to your email address.',
    devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
  });
};

/** POST /auth/email/verify-otp */
const verifyEmailOtp = async (req, res) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  const otp = String(req.body.otp || '').trim();

  if (!email || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ message: 'Valid email and 6-digit OTP are required.' });
  }

  const user = await User.findOne({ email }).select('+emailOtpHash +emailOtpExpires +emailOtpAttempts');
  if (!user || !user.emailOtpHash || !user.emailOtpExpires) {
    return res.status(400).json({ message: 'Request a fresh OTP before signing in.' });
  }

  if (user.emailOtpExpires.getTime() < Date.now()) {
    user.emailOtpHash = undefined;
    user.emailOtpExpires = undefined;
    user.emailOtpAttempts = 0;
    await user.save();
    return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
  }

  if (user.emailOtpAttempts >= MAX_OTP_ATTEMPTS) {
    return res.status(429).json({ message: 'Too many OTP attempts. Request a new OTP.' });
  }

  if (user.emailOtpHash !== hashOtp(otp)) {
    user.emailOtpAttempts += 1;
    await user.save();
    return res.status(400).json({
      message: `Invalid OTP. ${MAX_OTP_ATTEMPTS - user.emailOtpAttempts} attempt(s) remaining.`,
    });
  }

  // OTP verified
  user.verified = true;
  user.emailOtpHash = undefined;
  user.emailOtpExpires = undefined;
  user.emailOtpAttempts = 0;
  await user.save();

  sendAuthResponse(res, user);
};

/* ──────────────────────────────────────────────
   Phone OTP Login
────────────────────────────────────────────── */

/** POST /auth/phone/request-otp */
const requestPhoneOtp = async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  if (!phone) {
    return res.status(400).json({ message: 'Enter a valid phone number.' });
  }

  let user = await User.findOne({ phone }).select('+phoneOtpHash +phoneOtpExpires +phoneOtpAttempts');

  if (!user) {
    const tempId = crypto.randomBytes(4).toString('hex');
    user = await User.create({
      name: 'New User',
      email: `otp_${tempId}_${phone.replace(/\D/g, '')}@agroai.internal`,
      phone,
      password: await bcrypt.hash(crypto.randomBytes(24).toString('hex'), SALT_ROUNDS),
      role: 'Farmer',
      verified: false,
      phoneVerified: false,
    });
    user = await User.findById(user._id).select('+phoneOtpHash +phoneOtpExpires +phoneOtpAttempts');
  }

  const otp = createOtp();
  user.phoneOtpHash = hashOtp(otp);
  user.phoneOtpExpires = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  user.phoneOtpAttempts = 0;
  await user.save();

  let sms = { delivered: false };
  try {
    sms = await sendSms({
      to: phone,
      message: `Your Agro AI OTP is ${otp}. Expires in ${OTP_TTL_MINUTES} min. Do not share.`,
    });
  } catch (err) {
    console.error('SMS Service Error:', err.message);
  }

  res.json({
    message: sms.delivered ? 'OTP sent to your phone.' : 'OTP generated. Configure SMS credentials for real delivery.',
    phone,
    devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
  });
};

/** POST /auth/phone/verify-otp */
const verifyPhoneOtp = async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const otp = String(req.body.otp || '').trim();

  if (!phone || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ message: 'Valid phone number and 6-digit OTP are required.' });
  }

  const user = await User.findOne({ phone }).select('+phoneOtpHash +phoneOtpExpires +phoneOtpAttempts');
  if (!user || !user.phoneOtpHash || !user.phoneOtpExpires) {
    return res.status(400).json({ message: 'Request a fresh OTP before signing in.' });
  }

  if (user.phoneOtpExpires.getTime() < Date.now()) {
    user.phoneOtpHash = undefined;
    user.phoneOtpExpires = undefined;
    user.phoneOtpAttempts = 0;
    await user.save();
    return res.status(400).json({ message: 'OTP expired. Request a new one.' });
  }

  if (user.phoneOtpAttempts >= MAX_OTP_ATTEMPTS) {
    return res.status(429).json({ message: 'Too many OTP attempts. Request a new OTP.' });
  }

  if (user.phoneOtpHash !== hashOtp(otp)) {
    user.phoneOtpAttempts += 1;
    await user.save();
    return res.status(400).json({
      message: `Invalid OTP. ${MAX_OTP_ATTEMPTS - user.phoneOtpAttempts} attempt(s) remaining.`,
    });
  }

  user.phoneVerified = true;
  user.verified = true;
  user.phoneOtpHash = undefined;
  user.phoneOtpExpires = undefined;
  user.phoneOtpAttempts = 0;
  await user.save();

  sendAuthResponse(res, user);
};

/* ──────────────────────────────────────────────
   Token Refresh
────────────────────────────────────────────── */

/** POST /auth/refresh */
const refreshToken = async (req, res) => {
  const cookie = req.cookies.refreshToken;
  if (!cookie) return res.status(401).json({ message: 'Refresh token missing.' });

  try {
    const payload = require('jsonwebtoken').verify(cookie, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'Invalid refresh token.' });

    const accessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user);
    res.cookie('refreshToken', newRefreshToken, getCookieOptions());
    res.json({ accessToken });
  } catch {
    return res.status(401).json({ message: 'Invalid or expired refresh token.' });
  }
};

/* ──────────────────────────────────────────────
   Email Verification (link-based)
────────────────────────────────────────────── */

/** POST /auth/verify */
const verifyEmail = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'Verification token is required.' });

  const user = await User.findOne({ verificationToken: token }).select('+verificationToken');
  if (!user) return res.status(400).json({ message: 'Verification token is invalid or expired.' });

  user.verified = true;
  user.verificationToken = undefined;
  await user.save();

  res.json({ message: 'Your email has been verified! You can now sign in.' });
};

/* ──────────────────────────────────────────────
   Password Reset
────────────────────────────────────────────── */

/** POST /auth/forgot-password */
const forgotPassword = async (req, res) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpires');
  if (!user) {
    return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  try {
    await sendEmail({
      to: email,
      subject: '🔑 Reset your Agro AI password',
      html: `
      <div style="font-family:sans-serif;background:#0f172a;color:#e2e8f0;padding:32px;border-radius:12px;max-width:500px;margin:auto;">
        <h2 style="color:#4ade80;">🌾 Agro AI — Password Reset</h2>
        <p>Hi ${user.name},</p>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0;">Reset Password</a>
        <p style="color:#94a3b8;font-size:12px;">Or copy: ${resetUrl}</p>
        <p style="color:#475569;font-size:12px;">If you didn't request this, ignore this email.</p>
      </div>`,
    });
  } catch (err) {
    console.error('Reset email failed:', err.message);
  }

  res.json({
    message: 'Password reset instructions sent if the account exists.',
    resetUrl: process.env.NODE_ENV !== 'production' ? resetUrl : undefined,
  });
};

/** POST /auth/reset-password */
const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: 'Token and new password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) {
    return res.status(400).json({ message: 'Password reset token is invalid or expired.' });
  }

  user.password = await bcrypt.hash(password, SALT_ROUNDS);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: 'Your password has been reset successfully. You can now sign in.' });
};

/* ──────────────────────────────────────────────
   Current User
────────────────────────────────────────────── */

/** GET /auth/me */
const me = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ user });
};


/** POST /auth/google */
const googleLogin = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'Token is required' });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        phone: '+910000000000', // Placeholder
        password: await bcrypt.hash(crypto.randomBytes(24).toString('hex'), SALT_ROUNDS),
        role: 'Farmer',
        verified: true,
      });
    } else if (!user.verified) {
      user.verified = true;
      await user.save();
    }

    sendAuthResponse(res, user);
  } catch (error) {
    console.error('Google login error:', error.message);
    res.status(401).json({ message: 'Invalid Google token' });
  }
};

module.exports = {
  googleLogin,
  register,
  login,
  requestEmailOtp,
  verifyEmailOtp,
  requestPhoneOtp,
  verifyPhoneOtp,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  me,
};
