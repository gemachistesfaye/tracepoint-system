import React from "react";
import { LogOut, X } from "lucide-react";

const LogoutDialog = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
    <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-sm shadow-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-red-50 text-red-500 p-2.5 rounded-xl">
          <LogOut size={20} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Sign out?</h3>
          <p className="text-xs text-gray-500 mt-0.5">You'll need to sign in again to access your account.</p>
        </div>
        <button onClick={onCancel} className="ml-auto text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
          <X size={16} />
        </button>
      </div>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-all">
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  </div>
);

export default LogoutDialog;
