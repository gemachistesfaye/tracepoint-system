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

    const timer = setTimeout(() => setShowPrompt(true), 3000);

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
      <div className="bg-white border border-gray-200 rounded-3xl shadow-2xl p-5">
        <button onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
          <X size={18} />
        </button>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-600/30 shrink-0">
            <svg viewBox="0 0 32 32" width="34" height="34">
              <path d="M16 3C11.58 3 8 6.58 8 11c0 6 8 18 8 18s8-12 8-18c0-4.42-3.58-8-8-8z" fill="white"/>
              <circle cx="16" cy="11" r="3" fill="#2E7D32"/>
            </svg>
          </div>
          <div>
            <p className="font-black text-gray-900 text-lg leading-tight">HU Lost & Found</p>
            <p className="text-sm text-gray-500 mt-0.5">Quick access on your device</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          Install the app for faster access, offline support, and a native experience on your campus.
        </p>

        {deferredPrompt ? (
          <div className="flex gap-3">
            <button onClick={handleInstall}
              className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-2xl transition-all text-sm shadow-lg shadow-primary-600/20">
              <Download size={15} /> Install App
            </button>
            <button onClick={handleDismiss}
              className="flex-1 py-3 text-gray-600 font-semibold rounded-2xl hover:bg-gray-50 transition-colors text-sm border border-gray-200">
              Not Now
            </button>
          </div>
        ) : (
          <button onClick={handleDismiss}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-2xl transition-all text-sm shadow-lg shadow-primary-600/20">
            Got it
          </button>
        )}
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
