import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { updateProfile } from "firebase/auth";
import toast from "react-hot-toast";
import { User, Loader2, Save, Edit3 } from "lucide-react";

const Profile = () => {
  const { currentUser, userProfile, fetchProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { name: userProfile?.name || "", phone: userProfile?.phone || "", studentId: userProfile?.studentId || "" }
  });

  const onSubmit = async (data) => {
    try {
      await updateDoc(doc(db, "users", currentUser.uid), data);
      await updateProfile(currentUser, { displayName: data.name });
      await fetchProfile(currentUser.uid);
      toast.success("Profile updated!");
      setEditing(false);
    } catch { toast.error("Update failed."); }
  };

  const inputClass = `w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`;
  const disabledClass = `w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-500 cursor-not-allowed`;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-600/20 text-blue-400 p-3 rounded-2xl"><User size={22} /></div>
        <div>
          <h1 className="text-2xl font-black text-white">My Profile</h1>
          <p className="text-sm text-slate-400">Manage your account information</p>
        </div>
      </div>

      <div className="bg-white/3 border border-white/10 rounded-3xl p-8">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-black text-white">
            {userProfile?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-black text-white text-xl">{userProfile?.name}</p>
            <p className="text-sm text-slate-400">{userProfile?.email}</p>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full mt-1.5 inline-block ${
              userProfile?.role === "admin" ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-slate-400"
            }`}>{userProfile?.role}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[{ name: "name", label: "Full Name" }, { name: "studentId", label: "Student ID" }, { name: "phone", label: "Phone Number" }].map(({ name, label }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">{label}</label>
              <input type="text" disabled={!editing} className={editing ? inputClass : disabledClass} {...register(name)} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Email</label>
            <input type="email" value={currentUser?.email} disabled className={disabledClass} />
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
          </div>

          <div className="flex gap-3 pt-2">
            {editing ? (
              <>
                <button type="button" onClick={() => setEditing(false)}
                  className="flex-1 py-3 border border-white/10 text-slate-400 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setEditing(true)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors">
                <Edit3 size={16} /> Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
export default Profile;
