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
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setVisible(false);
      setDeferredPrompt(null);
    } else {
      setShowModal(true);
    }
  };

  if (!visible) return null;

  return (
    <>
      <button onClick={handleClick} title="Install HU Lost & Found App"
        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-3 py-2 rounded-xl transition-all text-sm font-medium">
        <Download size={15} />
        <span className="hidden sm:block">Install</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-end sm:items-center justify-center p-4 sm:p-6">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-sm shadow-2xl p-5">
            <button onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
              <X size={18} />
            </button>

            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-600/30 shrink-0">
                <svg viewBox="0 0 32 32" width="34" height="34">
                  <path d="M16 3C11.58 3 8 6.58 8 11c0 6 8 18 8 18s8-12 8-18c0-4.42-3.58-8-8-8z" fill="white"/>
                  <circle cx="16" cy="11" r="3" fill="#2E7D32"/>
                </svg>
              </div>
              <div>
                <p className="font-black text-gray-900 text-lg leading-tight">Install HU Lost & Found</p>
                <p className="text-sm text-gray-500 mt-0.5">Quick access on your device</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              Install our app for faster access, offline support, and a native experience.
            </p>

            <div className="space-y-3 mb-5">
              {isMobile ? (
                <>
                  <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-3.5">
                    <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center shrink-0 text-sm font-black">1</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Chrome / Android</p>
                      <p className="text-xs text-gray-500 mt-0.5">Tap menu <span className="text-primary-600 font-bold">&#8942;</span> &rarr; <span className="text-primary-600">"Add to Home Screen"</span></p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-3.5">
                    <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center shrink-0 text-sm font-black">2</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Safari / iPhone</p>
                      <p className="text-xs text-gray-500 mt-0.5">Tap Share <span className="text-primary-600 font-bold">&#8996;</span> &rarr; <span className="text-primary-600">"Add to Home Screen"</span></p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-3 bg-primary-50 border border-primary-100 rounded-2xl p-3.5">
                  <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center shrink-0 text-lg">&#128161;</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Almost ready!</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Look for the <span className="text-primary-600 font-bold">install icon</span> in your Chrome address bar, or come back in a moment and click Install again.</p>
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setShowModal(false)}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-2xl transition-all text-sm shadow-lg shadow-primary-600/20">
              <Download size={15} /> Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallButton;
