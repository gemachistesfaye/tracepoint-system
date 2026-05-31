import React, { useEffect, useState } from "react";
import { MapPin, X, Download, Smartphone } from "lucide-react";

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed or installed
    const dismissed = localStorage.getItem("pwa-dismissed");
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (dismissed || isStandalone) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show after 3 seconds
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-dismissed", "true");
  };

  if (!showPrompt || installed) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
      <div className="bg-[#0f1629] border border-blue-500/30 rounded-2xl shadow-2xl shadow-black/50 p-4 backdrop-blur-xl">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3 mb-4">
          <div className="bg-blue-600 text-white rounded-xl p-2.5 shrink-0 shadow-lg shadow-blue-600/30">
            <MapPin size={20} />
          </div>
          <div>
            <p className="font-bold text-white text-sm">Install TracePoint</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Install the app for faster access, offline support, and a native experience on your device.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 bg-white/5 rounded-xl p-3">
          <Smartphone size={14} className="text-blue-400 shrink-0" />
          <p className="text-xs text-slate-400">Works offline · No app store needed · Free</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 py-2.5 border border-white/10 text-slate-400 text-sm font-medium rounded-xl hover:bg-white/5 transition-colors"
          >
            Not now
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-600/20"
          >
            <Download size={14} /> Install App
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
