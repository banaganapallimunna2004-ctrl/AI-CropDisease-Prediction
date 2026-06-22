import { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft, Leaf, ShieldCheck } from 'lucide-react';
import authService from '../services/authService';

const PasswordStrength = ({ password }) => {
  const analysis = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
    const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-400'];
    return { score, label: labels[score] || '', color: colors[score] || '' };
  }, [password]);

  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-700">
        <div
          className={`h-full transition-all duration-300 ${analysis.color}`}
          style={{ width: `${analysis.score * 20}%` }}
        />
      </div>
      <p className={`mt-1 text-xs ${analysis.score >= 4 ? 'text-green-400' : analysis.score >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
        {analysis.label}
      </p>
    </div>
  );
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.resetPassword({ token, password });
      setMessage(res.data.message);
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset password. The link may be expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-auth-nature">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-green-600/15 blur-[150px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-700/15 blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 shadow-xl shadow-green-500/30">
              <Leaf className="h-8 w-8 text-slate-900" />
            </div>
            <h1 className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-3xl font-extrabold text-transparent">
              Agro AI
            </h1>
          </div>

          <div className="rounded-2xl border border-green-300 shadow-2xl shadow-green-900/20 bg-white/95 p-8 shadow-2xl backdrop-blur-xl">
            {!success ? (
              <>
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15">
                    <ShieldCheck className="h-7 w-7 text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Create new password</h2>
                  <p className="mt-1 text-sm text-slate-600">Make it strong and memorable.</p>
                </div>

                {!token && (
                  <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-sm text-red-300">
                    ⚠ Invalid or missing reset token. Please{' '}
                    <Link to="/forgot-password" className="underline">request a new reset link</Link>.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        id="reset-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        placeholder="Min. 8 characters"
                        required
                        minLength={8}
                        className="w-full rounded-xl border border-green-300 bg-white border-green-200 focus:bg-green-50 focus:border-green-600 py-3 pl-10 pr-12 text-slate-900 placeholder-slate-400 outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <PasswordStrength password={password} />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        id="reset-confirm-password"
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                        placeholder="Repeat your password"
                        required
                        className="w-full rounded-xl border border-green-300 bg-white border-green-200 focus:bg-green-50 focus:border-green-600 py-3 pl-10 pr-12 text-slate-900 placeholder-slate-400 outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="mt-1 text-xs text-red-400">Passwords don't match</p>
                    )}
                    {confirmPassword && password === confirmPassword && password.length >= 8 && (
                      <p className="mt-1 text-xs text-green-400">✓ Passwords match</p>
                    )}
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                      {error}
                    </div>
                  )}

                  <button
                    id="reset-submit"
                    type="submit"
                    disabled={isLoading || !token}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-3 font-semibold text-slate-900 shadow-lg shadow-green-700/30 transition hover:from-green-500 hover:to-emerald-500 disabled:opacity-60"
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Reset Password'}
                  </button>
                </form>
              </>
            ) : (
              <div className="py-4 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 shadow-lg shadow-green-500/20">
                  <CheckCircle2 className="h-10 w-10 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Password Reset! 🎉</h2>
                <p className="mt-3 text-slate-600">{message}</p>
                <p className="mt-2 text-sm text-slate-500">Redirecting to sign in…</p>
                <Link
                  to="/"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 font-semibold text-slate-900 shadow-lg shadow-green-700/30 transition hover:from-green-500 hover:to-emerald-500"
                >
                  Sign In Now
                </Link>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;
