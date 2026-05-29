import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { updateProfile } from "firebase/auth";
import toast from "react-hot-toast";
import { User, Loader2, Save } from "lucide-react";

const Profile = () => {
  const { currentUser, userProfile, fetchProfile } = useAuth();
  const [editing, setEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      name: userProfile?.name || "",
      phone: userProfile?.phone || "",
      studentId: userProfile?.studentId || "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await updateDoc(doc(db, "users", currentUser.uid), data);
      await updateProfile(currentUser, { displayName: data.name });
      await fetchProfile(currentUser.uid);
      toast.success("Profile updated!");
      setEditing(false);
    } catch {
      toast.error("Update failed.");
    }
  };

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500";

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 text-blue-600 p-2.5 rounded-xl">
          <User size={22} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
            {userProfile?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">{userProfile?.name}</p>
            <p className="text-sm text-gray-500">{userProfile?.email}</p>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1 inline-block ${
              userProfile?.role === "admin"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600"
            }`}>
              {userProfile?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { name: "name", label: "Full Name" },
            { name: "studentId", label: "Student ID" },
            { name: "phone", label: "Phone Number" },
          ].map(({ name, label }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type="text"
                disabled={!editing}
                className={inputClass}
                {...register(name)}
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={currentUser?.email}
              disabled
              className={inputClass}
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          <div className="flex gap-3 pt-2">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Changes
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="w-full py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100"
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
