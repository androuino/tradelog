import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';

export const LoginScreen = () => {
  const { user, loginWithOAuth, loginWithEmail, setupPasscode, continueAsGuest } = useJournal();

  const [authMode, setAuthMode] = useState('social'); // 'social' | 'email' | 'passcode'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setTimeout(() => {
      loginWithOAuth('Google', 'trader@example.com', 'Trader Pro');
      setIsLoading(false);
    }, 600);
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    setTimeout(() => {
      loginWithOAuth('Apple', 'trader@icloud.com', 'Trader Pro');
      setIsLoading(false);
    }, 600);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setTimeout(() => {
      loginWithEmail(email);
      setIsLoading(false);
    }, 500);
  };

  const handlePasscodeSubmit = (e) => {
    e.preventDefault();
    if (passcode.length < 4) return;
    setupPasscode(passcode);
  };

  return (
    <div 
      style={{
        paddingTop: 'max(1.5rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))'
      }}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden"
    >
      
      {/* Glow Background Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 p-0.5 shadow-2xl shadow-emerald-500/20 mx-auto mb-4">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-3xl">
              📈
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Trade<span className="text-emerald-400">Log</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Personal Trading Journal & Mindset Reflection
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => setAuthMode('social')}
            className={`py-2 rounded-lg text-xs font-semibold transition-all ${
              authMode === 'social'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Social Auth
          </button>

          <button
            type="button"
            onClick={() => setAuthMode('email')}
            className={`py-2 rounded-lg text-xs font-semibold transition-all ${
              authMode === 'email'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Email
          </button>

          <button
            type="button"
            onClick={() => setAuthMode('passcode')}
            className={`py-2 rounded-lg text-xs font-semibold transition-all ${
              authMode === 'passcode'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            PIN Lock
          </button>
        </div>

        {/* 1. SOCIAL OAUTH LOGIN */}
        {authMode === 'social' && (
          <div className="space-y-3">
            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs py-3 px-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
            </button>

            {/* Apple Sign In */}
            <button
              onClick={handleAppleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-3 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs py-3 px-4 rounded-xl border border-slate-700 shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.33.13-9.13-1.9-14.4-6.1-3.26-2.63-7.14-7.27-11.66-13.91-6.66-9.76-11.96-20.59-15.91-32.5-3.95-11.91-5.93-23.36-5.93-34.35 0-14.37 3.6-26.15 10.81-35.33 7.21-9.18 16.32-13.88 27.33-14.1 4.71 0 9.94 1.25 15.68 3.75 5.74 2.5 9.77 3.75 12.09 3.75 1.9 0 6.03-1.31 12.4-3.93 6.37-2.62 11.91-3.83 16.63-3.63 12.08.75 21.75 5.25 29.02 13.5-10.74 6.5-16.01 15.62-15.82 27.37.19 9.25 3.74 17 10.66 23.25 6.92 6.25 15.09 9.75 24.51 10.5-2.46 7.37-5.83 15.62-10.12 24.75zM119.22 31.88c0-6.75 2.44-13.25 7.31-19.5 4.88-6.25 11.06-10.37 18.56-12.38.38 1.13.56 2.25.56 3.38 0 6.87-2.5 13.5-7.5 19.87-5 6.37-11.25 10.37-18.75 12-0.12-.87-.18-2.00-.18-3.37z"/>
              </svg>
              <span>{isLoading ? 'Signing in...' : 'Continue with Apple'}</span>
            </button>
          </div>
        )}

        {/* 2. EMAIL / PASSWORD LOGIN */}
        {authMode === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  placeholder="trader@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <span>{isLoading ? 'Signing in...' : 'Sign In with Email'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 3. PASSCODE PIN LOCK */}
        {authMode === 'passcode' && (
          <form onSubmit={handlePasscodeSubmit} className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-2">
              <KeyRound className="w-6 h-6" />
            </div>

            <p className="text-xs text-slate-300">
              Set or enter a 4-digit PIN lock code to protect your journal entries.
            </p>

            <input
              type="password"
              maxLength="4"
              placeholder="••••"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-48 bg-slate-950 border border-slate-800 rounded-xl py-3 text-center text-xl font-mono tracking-widest text-emerald-400 focus:outline-none focus:border-emerald-500 mx-auto block"
              required
            />

            <button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all"
            >
              Unlock / Save PIN
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="my-6 border-t border-slate-800/80 relative">
          <span className="bg-slate-900 px-3 text-[10px] text-slate-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold">
            OR
          </span>
        </div>

        {/* Guest / Offline Local Mode */}
        <button
          onClick={continueAsGuest}
          className="w-full flex items-center justify-center space-x-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors"
        >
          <UserCheck className="w-4 h-4 text-slate-500" />
          <span>Continue Offline (Local Device Storage)</span>
        </button>

        {/* Footer Security Badge */}
        <div className="mt-6 pt-4 border-t border-slate-800/50 flex items-center justify-center space-x-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>AES-256 Client Storage Security</span>
        </div>

      </div>
    </div>
  );
};
