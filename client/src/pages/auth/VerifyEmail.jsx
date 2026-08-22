import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { MailCheck, KeyRound, AlertCircle, ArrowLeft, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const codeParam = searchParams.get('code') || '';

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState(codeParam);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const { verifyEmail } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (codeParam) {
      setCode(codeParam);
    }
  }, [codeParam]);

  const handleVerify = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !code) {
      setError('Please provide both your email and the 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      const data = await verifyEmail({ email, code });

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      setSuccessMsg('Account verified successfully! Redirecting to your dashboard...');
      setTimeout(() => {
        if (data.user.role === 'hr_admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 1200);
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Please enter your email to resend the code.');
      return;
    }
    setError('');
    setSuccessMsg('');
    try {
      setResending(true);
      const data = await useAuth().resendCode(email);
      setSuccessMsg(`A new code was sent! (Dev code: ${data.devVerificationCode})`);
      if (data.devVerificationCode) {
        setCode(data.devVerificationCode);
      }
    } catch (err) {
      setError(err.message || 'Failed to resend verification code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 font-sans selection:bg-emerald-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 shadow-xl shadow-emerald-500/30 text-white font-black text-2xl mb-4">
          <MailCheck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Verify Your Work Email
        </h1>
        <p className="text-sm text-slate-300 mt-2">
          Enter the 6-digit verification code sent to your inbox to activate your Dayflow account.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-white/20">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div className="flex-1 font-semibold">{successMsg}</div>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Work Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@dayflow.com"
                className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                6-Digit Verification Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 123456"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base tracking-widest font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-center"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full mt-3 font-bold shadow-md shadow-emerald-600/30"
            >
              Verify & Enter Dayflow
            </Button>
          </form>

          {/* Resend & Back */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              Resend Code
            </button>

            <Link
              to="/login"
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
