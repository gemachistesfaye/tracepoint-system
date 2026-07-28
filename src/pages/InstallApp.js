import React from "react";
import { Link } from "react-router-dom";
import { Download, ArrowLeft, Smartphone, Monitor, CheckCircle2 } from "lucide-react";

const InstallApp = () => {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-600/30">
              <svg viewBox="0 0 32 32" width="42" height="42">
                <path d="M16 3C11.58 3 8 6.58 8 11c0 6 8 18 8 18s8-12 8-18c0-4.42-3.58-8-8-8z" fill="white"/>
                <circle cx="16" cy="11" r="3" fill="#2E7D32"/>
              </svg>
            </div>
            <h1 className="text-2xl font-black text-gray-900">Install HU Lost&Found</h1>
            <p className="text-gray-500 text-sm mt-1">Quick access from your home screen</p>
          </div>

          <div className="space-y-3 mb-6">
            {[
              "Faster access - launch directly from your home screen",
              "Offline support - browse cached items without internet",
              "Push notifications - get alerted when items match",
              "Native experience - feels like a real app on your phone",
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-primary-600 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-600">{feature}</span>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
              {isMobile ? <Smartphone size={16} /> : <Monitor size={16} />}
              How to install
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center shrink-0 text-xs font-black">1</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Chrome / Android</p>
                  <p className="text-xs text-gray-500">Tap menu <span className="text-primary-600 font-bold">&#8942;</span> → "Add to Home Screen"</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center shrink-0 text-xs font-black">2</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Safari / iPhone</p>
                  <p className="text-xs text-gray-500">Tap Share <span className="text-primary-600 font-bold">&#8996;</span> → "Add to Home Screen"</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center shrink-0 text-xs font-black">3</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Desktop</p>
                  <p className="text-xs text-gray-500">Click the install icon in the address bar or use the browser menu</p>
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-2xl transition-all text-sm shadow-lg shadow-primary-600/20 active:scale-[0.98]"
          >
            <Download size={16} /> Done
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InstallApp;
