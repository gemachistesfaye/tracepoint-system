import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { getNotificationPreferences, updateNotificationPreferences } from "../firebase/firestore";
import toast from "react-hot-toast";
import { Settings as SettingsIcon, User, Lock, Bell, Shield, Loader2, Save, Eye, EyeOff } from "lucide-react";

const Settings = () => {
  const { currentUser, userProfile, fetchProfile } = useAuth();
  const [tab, setTab] = useState("profile");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);

  const profileForm = useForm({
    defaultValues: { name: userProfile?.name || "", phone: userProfile?.phone || "", studentId: userProfile?.studentId || "" }
  });

  const passwordForm = useForm();
  const notifForm = useForm();

  useEffect(() => {
    if (currentUser && tab === "notifications") {
      getNotificationPreferences(currentUser.uid).then(prefs => {
        notifForm.reset(prefs);
      });
    }
  }, [currentUser, tab]);

  const onProfileSubmit = async (data) => {
    try {
      await updateDoc(doc(db, "users", currentUser.uid), data);
      await updateProfile(currentUser, { displayName: data.name });
      await fetchProfile(currentUser.uid);
      toast.success("Profile updated!");
    } catch { toast.error("Update failed."); }
  };

  const onPasswordSubmit = async (data) => {
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, data.oldPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, data.newPassword);
      toast.success("Password updated!");
      passwordForm.reset();
    } catch (err) {
      if (err.code === "auth/wrong-password") toast.error("Current password is incorrect.");
      else toast.error("Failed to update password.");
    }
  };

  const onNotifSubmit = async (data) => {
    setNotifSaving(true);
    try {
      await updateNotificationPreferences(currentUser.uid, data);
      toast.success("Notification preferences saved!");
    } catch {
      toast.error("Failed to save preferences.");
    }
    setNotifSaving(false);
  };

  const inputClass = "w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  const tabs = [
    { key: "profile", label: "Profile", icon: <User size={15} /> },
    { key: "password", label: "Password", icon: <Lock size={15} /> },
    { key: "notifications", label: "Notifications", icon: <Bell size={15} /> },
    { key: "privacy", label: "Privacy", icon: <Shield size={15} /> },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary-50 text-primary-600 p-3 rounded-2xl"><SettingsIcon size={22} /></div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Manage your account preferences</p>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 border border-gray-200 p-1 rounded-2xl w-fit mb-8 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t.key ? "bg-primary-600 text-white shadow" : "text-gray-500 hover:text-gray-700"
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-6">Edit Profile</h2>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input type="text" className={inputClass} {...profileForm.register("name", { required: "Name is required" })} />
            </div>
            <div>
              <label className={labelClass}>Student/Staff ID</label>
              <input type="text" className={inputClass} {...profileForm.register("studentId")} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input type="tel" className={inputClass} {...profileForm.register("phone")} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={currentUser?.email} disabled className={`${inputClass} bg-gray-50 text-gray-400 cursor-not-allowed`} />
            </div>
            <button type="submit" disabled={profileForm.formState.isSubmitting}
              className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 px-6">
              {profileForm.formState.isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </form>
        </div>
      )}

      {tab === "password" && (
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-6">Change Password</h2>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div>
              <label className={labelClass}>Current Password</label>
              <div className="relative">
                <input type={showOldPassword ? "text" : "password"} className={`${inputClass} pr-11`}
                  {...passwordForm.register("oldPassword", { required: "Current password is required" })} />
                <button type="button" onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>New Password</label>
              <div className="relative">
                <input type={showNewPassword ? "text" : "password"} className={`${inputClass} pr-11`}
                  {...passwordForm.register("newPassword", { required: "New password is required", minLength: { value: 6, message: "Min. 6 characters" } })} />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordForm.formState.errors.newPassword && (
                <p className="text-xs text-red-500 mt-1">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Confirm New Password</label>
              <input type="password" className={inputClass}
                {...passwordForm.register("confirmPassword", {
                  required: "Please confirm", validate: val => val === passwordForm.getValues("newPassword") || "Passwords don't match"
                })} />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <button type="submit" disabled={passwordForm.formState.isSubmitting}
              className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 px-6">
              {passwordForm.formState.isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              Update Password
            </button>
          </form>
        </div>
      )}

      {tab === "notifications" && (
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-6">Notification Preferences</h2>
          <form onSubmit={notifForm.handleSubmit(onNotifSubmit)} className="space-y-4">
            {[
              { name: "emailNotifications", label: "Email Notifications", desc: "Receive email alerts for important updates" },
              { name: "pushNotifications", label: "Push Notifications", desc: "Browser notifications for real-time alerts" },
              { name: "matchAlerts", label: "Match Alerts", desc: "Get notified when a potential match is found" },
              { name: "claimUpdates", label: "Claim Updates", desc: "Status changes on your submitted claims" },
              { name: "adminAnnouncements", label: "Admin Announcements", desc: "System-wide announcements from administrators" },
            ].map(f => (
              <label key={f.name} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{f.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                </div>
                <input type="checkbox" className="w-5 h-5 rounded-lg text-primary-600 focus:ring-primary-500"
                  {...notifForm.register(f.name)} />
              </label>
            ))}
            <button type="submit" disabled={notifSaving}
              className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 px-6">
              {notifSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Preferences
            </button>
          </form>
        </div>
      )}

      {tab === "privacy" && (
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-6">Privacy Settings</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-sm font-semibold text-gray-900">Profile Visibility</p>
              <p className="text-xs text-gray-500 mt-0.5">Your name is visible to other users when you report or claim items.</p>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-sm font-semibold text-gray-900">Contact Information</p>
              <p className="text-xs text-gray-500 mt-0.5">Your phone/email is only shared with verified claimants after admin approval.</p>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-sm font-semibold text-gray-900">Data Retention</p>
              <p className="text-xs text-gray-500 mt-0.5">Resolved items are archived after 90 days. Contact admin for data deletion requests.</p>
            </div>
            <Link to="/profile" className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
              Edit Profile Information
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
