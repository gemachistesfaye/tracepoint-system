import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { MapPin, Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      toast.success("Account created! Welcome to TracePoint.");
      navigate("/home");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") toast.error("Email already in use. Please sign in.");
      else toast.error("Registration failed. Please try again.");
    }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const labelClass = "block text-sm font-medium text-slate-400 mb-1.5";
  const errorClass = "text-xs text-red-400 mt-1";

  return (
    <div className="min-h-screen bg-[#0a0f1e] px-4 py-6">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute top-1/4 right-1/3 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back to website — always visible top-left */}
      <div className="relative max-w-md mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-8 transition-colors group">
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          Back to website
        </Link>
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md mx-auto pb-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-2xl mb-4 shadow-lg shadow-blue-600/30">
            <MapPin size={26} />
          </div>
          <h1 className="text-2xl font-black text-white">TracePoint</h1>
          <p className="text-sm text-slate-500 mt-1">Haramaya University Lost & Found</p>
        </div>

        <div className="bg-white/3 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white mb-6">Create your account</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input type="text" placeholder="Gemachi Tesfaye" className={inputClass}
                {...register("name", { required: "Full name is required" })} />
              {errors.name && <p className={errorClass}>{errors.name.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Email Address *</label>
              <input type="email" placeholder="you@haramaya.edu.et" className={inputClass}
                {...register("email", { required: "Email is required" })} />
              {errors.email && <p className={errorClass}>{errors.email.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Student ID</label>
                <input type="text" placeholder="HU/XXXX/XX" className={inputClass} {...register("studentId")} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input type="tel" placeholder="+251 9XX XXX XXX" className={inputClass} {...register("phone")} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Password *</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Min. 6 characters"
                  className={`${inputClass} pr-11`}
                  {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min. 6 characters" } })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className={errorClass}>{errors.password.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Confirm Password *</label>
              <input type="password" placeholder="Repeat password" className={inputClass}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: val => val === password || "Passwords do not match"
                })} />
              {errors.confirmPassword && <p className={errorClass}>{errors.confirmPassword.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 shadow-lg shadow-blue-600/20 mt-2">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />} Create Account
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
