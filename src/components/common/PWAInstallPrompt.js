import React, { useEffect, useState } from "react";
import { X, Download } from "lucide-react";

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("pwa-dismissed");
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (dismissed || isStandalone) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowPrompt(true), 2500);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setShowPrompt(false));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] w-full max-w-sm px-4">
      <div className="bg-[#1a1a2e] border border-white/10 rounded-3xl shadow-2xl shadow-black/60 p-5 backdrop-blur-xl">
        {/* Close */}
        <button onClick={handleDismiss}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
          <X size={18} />
        </button>

        {/* App info row */}
        <div className="flex items-center gap-4 mb-4">
          {/* App icon */}
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0">
            <svg viewBox="0 0 32 32" width="36" height="36">
              <path d="M16 3C11.58 3 8 6.58 8 11c0 6 8 18 8 18s8-12 8-18c0-4.42-3.58-8-8-8z" fill="white"/>
              <circle cx="16" cy="11" r="3" fill="#2563eb"/>
            </svg>
          </div>
          <div>
            <p className="font-black text-white text-lg leading-tight">TracePoint - HU</p>
            <p className="text-sm text-slate-400 mt-0.5">Quick access on your device</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-300 leading-relaxed mb-5">
          Install our app for faster access, offline support, and a native experience on your campus.
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button onClick={handleInstall}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-2xl transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-600/20 text-sm">
            <Download size={16} /> Install
          </button>
          <button onClick={handleDismiss}
            className="flex-1 py-3 text-slate-300 hover:text-white font-semibold rounded-2xl hover:bg-white/5 transition-colors text-sm border border-white/10">
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
