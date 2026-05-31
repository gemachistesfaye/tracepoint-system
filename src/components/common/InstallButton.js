import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";

const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (isStandalone) return;

    // Show button regardless — will use native prompt or show instructions
    setVisible(true);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setVisible(false));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setVisible(false);
      setDeferredPrompt(null);
    } else {
      // Show manual instructions toast
      alert("To install:\n• Chrome: Menu (⋮) → Add to Home Screen\n• Safari: Share (⎙) → Add to Home Screen");
    }
  };

  if (!visible) return null;

  return (
    <button onClick={handleClick} title="Install TracePoint App"
      className="flex items-center gap-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-xl transition-all text-sm font-medium">
      <Download size={15} />
      <span className="hidden sm:block">Install</span>
    </button>
  );
};

export default InstallButton;
