import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { MapPin, Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";

const Register = () => {
  const { register: registerUser, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      toast.success("Account created! Welcome to HU Lost & Found.");
      navigate("/home");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") toast.error("Email already in use. Please sign in.");
      else toast.error("Registration failed. Please try again.");
    }
  };

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Welcome!");
      navigate("/home");
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        toast.error("Google sign-in failed.");
      }
    }
    setGoogleLoading(false);
  };

  const inputClass = "w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
  const errorClass = "text-xs text-red-500 mt-1";

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="relative max-w-md mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-8 transition-colors group">
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          Back to website
        </Link>
      </div>

      <div className="relative w-full max-w-md mx-auto pb-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 text-white rounded-2xl mb-4 shadow-lg shadow-primary-600/30">
            <MapPin size={26} />
          </div>
          <h1 className="text-2xl font-black text-gray-900">HU Lost & Found</h1>
          <p className="text-sm text-gray-500 mt-1">Haramaya University Lost & Found</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Create your account</h2>

          <button onClick={handleGoogleRegister} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-all disabled:opacity-50 mb-4">
            {googleLoading ? <Loader2 size={16} className="animate-spin" /> : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Sign up with Google
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-400">or register with email</span></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className={labelClass}>Full Name *</label>
              <input id="name" type="text" placeholder="Gemachi Tesfaye" className={inputClass}
                {...register("name", { required: "Full name is required" })} />
              {errors.name && <p className={errorClass}>{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="reg-email" className={labelClass}>University Email *</label>
              <input id="reg-email" type="email" placeholder="you@haramaya.edu.et" className={inputClass}
                {...register("email", { required: "Email is required" })} />
              {errors.email && <p className={errorClass}>{errors.email.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="role" className={labelClass}>I am a *</label>
                <select id="role" className={inputClass} {...register("role", { required: "Role is required" })}>
                  <option value="user">Student</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div>
                <label htmlFor="studentId" className={labelClass}>Student/Staff ID</label>
                <input id="studentId" type="text" placeholder="HU/XXXX/XX" className={inputClass} {...register("studentId")} />
              </div>
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>Phone</label>
              <input id="phone" type="tel" placeholder="+251 9XX XXX XXX" className={inputClass}
                {...register("phone", { pattern: { value: /^\+?[\d\s-]{7,15}$/, message: "Invalid phone number" } })} />
              {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="department" className={labelClass}>Department</label>
                <input id="department" type="text" placeholder="e.g. Computer Science" className={inputClass} {...register("department")} />
              </div>
              <div>
                <label htmlFor="college" className={labelClass}>College</label>
                <input id="college" type="text" placeholder="e.g. College of Computing" className={inputClass} {...register("college")} />
              </div>
            </div>
            <div>
              <label htmlFor="reg-password" className={labelClass}>Password *</label>
              <div className="relative">
                <input id="reg-password" type={showPassword ? "text" : "password"} placeholder="Min. 6 characters"
                  className={`${inputClass} pr-11`}
                  {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min. 6 characters" } })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className={errorClass}>{errors.password.message}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className={labelClass}>Confirm Password *</label>
              <input id="confirmPassword" type="password" placeholder="Repeat password" className={inputClass}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: val => val === password || "Passwords do not match"
                })} />
              {errors.confirmPassword && <p className={errorClass}>{errors.confirmPassword.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 shadow-lg shadow-primary-600/25 mt-2">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />} Create Account
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
