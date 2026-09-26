import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 rounded-lg bg-emerald-600 font-medium text-white shadow-sm hover:bg-emerald-500 transition active:scale-95 ${
          compact ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-2 text-sm'
        }`}
        title="Install BettaTraka CRM on your phone or desktop"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // Fallback interactive button for demo / iOS guide
  return (
    <>
      <button
        onClick={() => setShowIOSGuide(true)}
        className={`flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/60 font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition ${
          compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs'
        }`}
        title="Install BettaTraka Progressive Web App"
      >
        <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
        <span>Install PWA</span>
      </button>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-white">Install BettaTraka PWA</h3>
              </div>
              <button 
                onClick={() => setShowIOSGuide(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-4 space-y-3 text-xs text-slate-300">
              <p className="leading-relaxed">
                BettaTraka is built as an installable Progressive Web App (PWA). No app store download needed:
              </p>
              <div className="rounded-lg bg-slate-800/80 p-3 space-y-2 border border-slate-700/60">
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-center font-bold text-xs flex items-center justify-center">1</span>
                  <span><strong>On iPhone / iPad:</strong> Tap Safari's <strong>Share</strong> icon (box with up arrow), scroll down, and tap <strong>Add to Home Screen</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-center font-bold text-xs flex items-center justify-center">2</span>
                  <span><strong>On Android:</strong> Tap the Chrome menu (3 dots) and select <strong>Install app</strong> or <strong>Add to Home screen</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-center font-bold text-xs flex items-center justify-center">3</span>
                  <span><strong>On Mac / Windows:</strong> Click the install icon in your browser address bar.</span>
                </div>
              </div>
              <p className="text-slate-400 text-[11px]">
                Enjoy lightning-fast offline access, full-screen view, and real-time order push notifications.
              </p>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-semibold text-white transition shadow-sm"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
