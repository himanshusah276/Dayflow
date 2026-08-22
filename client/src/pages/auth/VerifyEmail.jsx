import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../api/apiClient';
import { Button } from '../../components/common/Button';
import { MailCheck, KeyRound, AlertCircle, ArrowLeft, RefreshCw, CheckCircle2, Sun, Moon, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const rawParam = searchParams.get('identifier') || searchParams.get('phone') || searchParams.get('email') || '';

  const [identifier, setIdentifier] = useState(rawParam);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(
    rawParam
      ? rawParam.includes('@')
        ? `A 6-digit verification code has been dispatched to your email (${rawParam}). Please check your inbox and spam folder.`
        : `A 6-digit verification OTP has been dispatched to your phone (${rawParam}). Please check your SMS messages.`
      : ''
  );
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const { verifyEmail } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const isPhone = identifier && (/^\+?[0-9\s-]{8,15}$/.test(identifier) || identifier.startsWith('+91'));

  const handleVerify = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!identifier || !code || code.trim().length !== 6) {
      setError('Please enter your mobile number or email and the 6-digit OTP code you received.');
      return;
    }

    try {
      setLoading(true);
      const data = await verifyEmail({
        identifier: identifier.trim(),
        email: identifier.trim(),
        phone: identifier.trim(),
        code: code.trim()
      });

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
      setError(err.message || 'Invalid verification code. Please check your SMS/email and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!identifier) {
      setError('Please enter your mobile phone number or email to resend OTP.');
      return;
    }
    setError('');
    setSuccessMsg('');
    try {
      setResending(true);
      await api.resendCode(identifier);
      setSuccessMsg(
        identifier.includes('@')
          ? `A fresh verification code was sent to ${identifier}. Please check your email inbox.`
          : `A fresh OTP was sent to ${identifier}. Please check your mobile SMS.`
      );
      setCode('');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 font-sans text-slate-100 selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with theme toggle */}
      <div className="absolute top-6 right-6">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/15 transition-all cursor-pointer shadow-lg"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-200" />}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6 relative z-10">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 shadow-xl shadow-emerald-500/30 text-white font-black text-2xl mb-3">
          {isPhone ? <Smartphone className="w-7 h-7" /> : <MailCheck className="w-7 h-7" />}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Verify Your Account
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          Enter the 6-digit OTP sent to your mobile phone or email.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-white/20 dark:border-slate-800 text-slate-900 dark:text-slate-100 transition-colors">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div className="flex-1 font-semibold">{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <div className="flex-1 font-semibold">{successMsg}</div>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Mobile Number (+91) or Work Email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="+91 98765 43210 or name@dayflow.com"
                className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                6-Digit Verification Code (OTP)
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
                  placeholder="Enter 6-digit code"
                  autoComplete="one-time-code"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base tracking-widest font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-center font-bold"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 text-center">
                Please type the 6-digit code received on your phone SMS or email.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full mt-3 font-bold shadow-md shadow-emerald-600/30 cursor-pointer"
            >
              Verify OTP & Enter Dayflow
            </Button>
          </form>

          {/* Resend & Back */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              Resend OTP
            </button>

            <Link
              to="/login"
              className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
