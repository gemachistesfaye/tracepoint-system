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
    defaultValues: {
      name: userProfile?.name || "",
      phone: userProfile?.phone || "",
      studentId: userProfile?.studentId || "",
      department: userProfile?.department || "",
      college: userProfile?.college || "",
    }
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

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all";
  const disabledClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-400 cursor-not-allowed";

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary-50 text-primary-600 p-3 rounded-2xl"><User size={22} /></div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500">Manage your account information</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-2xl font-black text-white">
            {userProfile?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-black text-gray-900 text-xl">{userProfile?.name}</p>
            <p className="text-sm text-gray-500">{userProfile?.email}</p>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full mt-1.5 inline-block ${
              userProfile?.role === "admin" ? "bg-purple-50 text-purple-600" : "bg-primary-50 text-primary-600"
            }`}>{userProfile?.role}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[{ name: "name", label: "Full Name" }, { name: "studentId", label: "Student ID" }, { name: "phone", label: "Phone Number" }, { name: "department", label: "Department" }, { name: "college", label: "College" }].map(({ name, label }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
              <input type="text" disabled={!editing} className={editing ? inputClass : disabledClass} {...register(name)} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
            <input type="email" value={currentUser?.email} disabled className={disabledClass} />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          <div className="flex gap-3 pt-2">
            {editing ? (
              <>
                <button type="button" onClick={() => setEditing(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setEditing(true)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors">
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
