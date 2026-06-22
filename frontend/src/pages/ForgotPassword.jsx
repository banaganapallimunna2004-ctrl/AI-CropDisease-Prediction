import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Loader2, CheckCircle2, ArrowLeft, Leaf } from 'lucide-react';
import authService from '../services/authService';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setError(''); setIsLoading(true);
    try {
      const res = await authService.forgotPassword({ email: email.trim().toLowerCase() });
      setMessage(res.data.message);
      setSent(true);

      // In dev mode, show the reset URL
      if (res.data.resetUrl) {
        console.info('🔑 Dev reset URL:', res.data.resetUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
            {!sent ? (
              <>
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15">
                    <Mail className="h-7 w-7 text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Reset your password</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Enter your registered email and we'll send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        id="forgot-email"
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        placeholder="farmer@example.com"
                        required
                        className="w-full rounded-xl border border-green-300 bg-white border-green-200 focus:bg-green-50 focus:border-green-600 py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500/30"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                      {error}
                    </div>
                  )}

                  <button
                    id="forgot-submit"
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-3 font-semibold text-slate-900 shadow-lg shadow-green-700/30 transition hover:from-green-500 hover:to-emerald-500 disabled:opacity-60"
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Reset Link'}
                  </button>
                </form>
              </>
            ) : (
              <div className="py-4 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 shadow-lg shadow-green-500/20">
                  <CheckCircle2 className="h-10 w-10 text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Check your email</h2>
                <p className="mt-3 text-slate-600">{message}</p>
                <div className="mt-4 rounded-xl border border-green-900/40 bg-green-50 border-green-200 p-4 text-sm text-slate-600">
                  <p>Didn't receive it? Check your spam folder or wait a few minutes.</p>
                </div>
                <button
                  onClick={() => { setSent(false); setEmail(''); }}
                  className="mt-4 text-sm text-green-500 hover:text-green-400"
                >
                  Try a different email
                </button>
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

export default ForgotPassword;
