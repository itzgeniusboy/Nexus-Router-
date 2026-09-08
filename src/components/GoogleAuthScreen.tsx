import React, { useState } from 'react';
import { Flame, Shield, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { auth, googleProvider, signInWithPopup } from '../lib/firebase';

interface GoogleAuthScreenProps {
  onSuccess?: () => void;
}

export const GoogleAuthScreen: React.FC<GoogleAuthScreenProps> = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      console.error('Google Sign In Error:', err);
      if (err instanceof Error) {
        if (err.message.includes('popup-closed-by-user')) {
          setErrorMsg('Sign-in cancelled. Please try again.');
        } else {
          setErrorMsg(err.message);
        }
      } else {
        setErrorMsg('Failed to sign in with Google. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#FF6B35]/15 to-[#FFB627]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Authentication Card */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Brand Icon & Heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B35] via-[#FFB627] to-[#141416] p-[2px] shadow-[0_0_30px_rgba(255,107,53,0.35)] mb-4">
            <div className="w-full h-full rounded-[14px] bg-[#121215] flex items-center justify-center">
              <Flame className="w-8 h-8 text-[#FFB627]" />
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
            Nexus Gateway
          </h1>
          <p className="text-sm text-slate-400 mt-1.5 font-medium">
            Multi-Account AI Key Pool &amp; Failover Hub
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-[#151518]/90 backdrop-blur-xl border border-white/[0.09] rounded-2xl p-6 sm:p-8 shadow-2xl">
          
          <div className="mb-6">
            <h2 className="text-base sm:text-lg font-bold text-white mb-1">
              Welcome! Apni Gmail se Login karein
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Login karne ke baad aap Google AI Studio, Groq, Cerebras jaise multiple providers select karke apni free keys save kar sakte hain.
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <span className="shrink-0 text-base leading-none mt-0.5">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Primary Action: Google Sign In Button */}
          <button
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-900 font-semibold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed select-none group"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
            ) : (
              <>
                {/* SVG Google 'G' Logo */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span className="font-bold">Continue with Google</span>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>

          {/* Key Advantages List */}
          <div className="mt-8 pt-6 border-t border-white/[0.08] space-y-3">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Free Forever • No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <Zap className="w-4 h-4 text-[#FFB627] shrink-0" />
              <span>Multiple Gmail keys pool karke 0 rate limit</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <Shield className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Aapki keys encrypted Firestore vault me surakshit</span>
            </div>
          </div>

        </div>

        {/* Security Note */}
        <p className="text-center text-[11px] text-slate-400 mt-6 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Apne personal terminal agents (OpenCode, Cursor, Aider) ke liye</span>
        </p>

      </div>
    </div>
  );
};
