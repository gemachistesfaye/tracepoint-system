import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";

const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setCanInstall(false));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setCanInstall(false);
    setDeferredPrompt(null);
  };

  if (!canInstall) return null;

  return (
    <button
      onClick={handleInstall}
      title="Install TracePoint App"
      className="flex items-center gap-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-xl transition-all text-sm font-medium"
    >
      <Download size={15} />
      <span className="hidden sm:block">Install</span>
    </button>
  );
};

export default InstallButton;
