import React, { useEffect, useState, useCallback } from "react";
import { X, Download, Smartphone, Monitor, CheckCircle2 } from "lucide-react";

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [installed, setInstalled] = useState(false);

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const dismissForever = useCallback(() => {
    localStorage.setItem("pwa-dismissed", Date.now().toString());
  }, []);

  const wasRecentlyDismissed = useCallback(() => {
    const dismissed = localStorage.getItem("pwa-dismissed");
    if (!dismissed) return false;
    const elapsed = Date.now() - parseInt(dismissed, 10);
    return elapsed < 7 * 24 * 60 * 60 * 1000; // 7 days
  }, []);

  useEffect(() => {
    if (isStandalone || wasRecentlyDismissed()) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowBanner(true), 4000);
    };

    const installedHandler = () => {
      setInstalled(true);
      setShowBanner(false);
      setShowModal(false);
      dismissForever();
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, [isStandalone, wasRecentlyDismissed, dismissForever]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      setShowModal(true);
      return;
    }
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
        dismissForever();
      }
      setDeferredPrompt(null);
      setShowBanner(false);
      setShowModal(false);
    } catch {
      setShowModal(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowModal(false);
    dismissForever();
  };

  if (isStandalone || installed) return null;

  return (
    <>
      {/* Bottom-right floating banner */}
      {showBanner && !showModal && (
        <div className="fixed bottom-6 right-6 z-[999] w-full max-w-sm animate-slide-up">
          <div className="bg-white border border-gray-200 rounded-3xl shadow-2xl p-5">
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-600/30 shrink-0">
                <svg viewBox="0 0 32 32" width="30" height="30">
                  <path d="M16 3C11.58 3 8 6.58 8 11c0 6 8 18 8 18s8-12 8-18c0-4.42-3.58-8-8-8z" fill="white"/>
                  <circle cx="16" cy="11" r="3" fill="#2E7D32"/>
                </svg>
              </div>
              <div>
                <p className="font-black text-gray-900 leading-tight">Install HU Lost&Found</p>
                <p className="text-sm text-gray-500 mt-0.5">Quick access from your home screen</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleInstall}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-2xl transition-all text-sm shadow-lg shadow-primary-600/20 active:scale-95"
              >
                <Download size={15} /> Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-5 py-3 text-gray-500 font-semibold rounded-2xl hover:bg-gray-50 transition-colors text-sm border border-gray-200"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual install modal (shown when browser doesn't support beforeinstallprompt) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-end sm:items-center justify-center p-4 sm:p-6">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-sm shadow-2xl p-5">
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
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
                <p className="font-black text-gray-900 text-lg leading-tight">Install HU Lost&Found</p>
                <p className="text-sm text-gray-500 mt-0.5">Add to your home screen</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              Get faster access, offline support, and a native app experience on campus.
            </p>

            <div className="space-y-3 mb-5">
              <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-3.5">
                {isMobile ? (
                  <Smartphone size={18} className="text-primary-600 mt-0.5 shrink-0" />
                ) : (
                  <Monitor size={18} className="text-primary-600 mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {isMobile ? "Mobile" : "Desktop"} Instructions
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {isMobile ? (
                      <>
                        Tap the <span className="text-primary-600 font-bold">Share</span> button
                        (Safari) or menu <span className="text-primary-600 font-bold">&#8942;</span> (Chrome),
                        then select <span className="text-primary-600 font-bold">"Add to Home Screen"</span>
                      </>
                    ) : (
                      <>
                        Look for the <span className="text-primary-600 font-bold">install icon</span> in
                        your address bar, or use your browser's menu to install this app.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleInstall}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-2xl transition-all text-sm shadow-lg shadow-primary-600/20 active:scale-95"
              >
                <Download size={15} /> Install Now
              </button>
              <button
                onClick={handleDismiss}
                className="px-5 py-3.5 text-gray-500 font-semibold rounded-2xl hover:bg-gray-50 transition-colors text-sm border border-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* Small inline install button for Navbar */
export const InstallButton = ({ onOpenModal }) => {
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (isStandalone) return;

    const handler = (e) => {
      e.preventDefault();
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setCanInstall(false));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!canInstall) return null;

  return null; // Handled by PWAInstallPrompt banner
};

export default PWAInstallPrompt;
