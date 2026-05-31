import React, { useEffect, useState } from "react";
import { X, Download } from "lucide-react";

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    const dismissed = localStorage.getItem("pwa-dismissed");

    if (isStandalone || dismissed) return;

    // Always show after 3 seconds — no conditions
    const timer = setTimeout(() => setShowPrompt(true), 3000);

    // Capture native install prompt if available
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setShowPrompt(false);
      localStorage.setItem("pwa-dismissed", "true");
    });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
    setShowPrompt(false);
    localStorage.setItem("pwa-dismissed", "true");
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[999] w-full max-w-sm">
      <div className="bg-[#0f1629] border border-white/10 rounded-3xl shadow-2xl shadow-black/60 p-5">
        <button onClick={handleDismiss}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
          <X size={18} />
        </button>

        {/* App info */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0">
            <svg viewBox="0 0 32 32" width="34" height="34">
              <path d="M16 3C11.58 3 8 6.58 8 11c0 6 8 18 8 18s8-12 8-18c0-4.42-3.58-8-8-8z" fill="white"/>
              <circle cx="16" cy="11" r="3" fill="#2563eb"/>
            </svg>
          </div>
          <div>
            <p className="font-black text-white text-lg leading-tight">TracePoint - HU</p>
            <p className="text-sm text-slate-400 mt-0.5">Quick access on your device</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          Install the app for faster access, offline support, and a native experience on your campus.
        </p>

        {/* Show native button OR manual instructions */}
        {deferredPrompt ? (
          <div className="flex gap-3">
            <button onClick={handleInstall}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-2xl transition-all text-sm shadow-lg shadow-blue-600/20">
              <Download size={15} /> Install App
            </button>
            <button onClick={handleDismiss}
              className="flex-1 py-3 text-slate-300 font-semibold rounded-2xl hover:bg-white/5 transition-colors text-sm border border-white/10">
              Not Now
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white/5 border border-white/8 rounded-xl p-3 mb-4 text-xs text-slate-400 space-y-1.5">
              <p className="font-bold text-slate-300">📱 Install on Chrome / Android:</p>
              <p>Tap menu <span className="text-blue-400 font-bold">⋮</span> → <span className="text-blue-400">"Add to Home Screen"</span></p>
              <p className="font-bold text-slate-300 pt-1">🍎 Install on Safari / iOS:</p>
              <p>Tap Share <span className="text-blue-400 font-bold">⎙</span> → <span className="text-blue-400">"Add to Home Screen"</span></p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleDismiss}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-2xl transition-all text-sm">
                <Download size={15} /> Got it
              </button>
              <button onClick={handleDismiss}
                className="flex-1 py-3 text-slate-300 font-semibold rounded-2xl hover:bg-white/5 transition-colors text-sm border border-white/10">
                Not Now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
