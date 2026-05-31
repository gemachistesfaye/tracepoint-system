import React, { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (isStandalone) return;

    setVisible(true);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setVisible(false));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const handleClick = async () => {
    if (deferredPrompt) {
      // Native Chrome/Android install prompt available
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setVisible(false);
      setDeferredPrompt(null);
    } else if (isMobile) {
      // Mobile without native prompt — show instructions
      setShowModal(true);
    } else {
      // Desktop — Chrome will show native prompt after SW is active
      // Show a small tooltip instead of full modal
      setShowModal(true);
    }
  };

  if (!visible) return null;

  return (
    <>
      <button onClick={handleClick} title="Install TracePoint App"
        className="flex items-center gap-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-xl transition-all text-sm font-medium">
        <Download size={15} />
        <span className="hidden sm:block">Install</span>
      </button>

      {/* Styled install instructions modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] flex items-end sm:items-center justify-center p-4 sm:p-6">
          <div className="bg-[#0f1629] border border-white/10 rounded-3xl w-full max-w-sm shadow-2xl p-5">
            {/* Close */}
            <button onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
              <X size={18} />
            </button>

            {/* App info */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0">
                <svg viewBox="0 0 32 32" width="34" height="34">
                  <path d="M16 3C11.58 3 8 6.58 8 11c0 6 8 18 8 18s8-12 8-18c0-4.42-3.58-8-8-8z" fill="white"/>
                  <circle cx="16" cy="11" r="3" fill="#2563eb"/>
                </svg>
              </div>
              <div>
                <p className="font-black text-white text-lg leading-tight">Install TracePoint</p>
                <p className="text-sm text-slate-400 mt-0.5">Quick access on your device</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-5">
              Install our app for faster access, offline support, and a native experience.
            </p>

            {/* Instructions */}
            <div className="space-y-3 mb-5">
              {isMobile ? (
                <>
                  <div className="flex items-start gap-3 bg-white/5 border border-white/8 rounded-2xl p-3.5">
                    <div className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center shrink-0 text-sm font-black">1</div>
                    <div>
                      <p className="text-sm font-bold text-white">Chrome / Android</p>
                      <p className="text-xs text-slate-400 mt-0.5">Tap menu <span className="text-blue-400 font-bold">⋮</span> → <span className="text-blue-400">"Add to Home Screen"</span></p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white/5 border border-white/8 rounded-2xl p-3.5">
                    <div className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center shrink-0 text-sm font-black">2</div>
                    <div>
                      <p className="text-sm font-bold text-white">Safari / iPhone</p>
                      <p className="text-xs text-slate-400 mt-0.5">Tap Share <span className="text-blue-400 font-bold">⎙</span> → <span className="text-blue-400">"Add to Home Screen"</span></p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3.5">
                  <div className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center shrink-0 text-lg">💡</div>
                  <div>
                    <p className="text-sm font-bold text-white">Almost ready!</p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">Look for the <span className="text-blue-400 font-bold">install icon ⊕</span> in your Chrome address bar, or come back in a moment and click Install again.</p>
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setShowModal(false)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-2xl transition-all text-sm shadow-lg shadow-blue-600/20">
              <Download size={15} /> Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallButton;
