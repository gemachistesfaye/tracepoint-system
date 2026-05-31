import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { MapPin, Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ email, password }) => {
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch {
      toast.error("Invalid email or password.");
    }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Back to website */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-6 transition-colors group">
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to website
        </Link>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-2xl mb-4 shadow-lg shadow-blue-600/30">
            <MapPin size={26} />
          </div>
          <h1 className="text-2xl font-black text-white">TracePoint</h1>
          <p className="text-sm text-slate-500 mt-1">Haramaya University Lost & Found</p>
        </div>

        <div className="bg-white/3 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white mb-6">Sign in to your account</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Email</label>
              <input type="email" placeholder="you@haramaya.edu.et" className={inputClass}
                {...register("email", { required: "Email is required" })} />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="••••••••"
                  className={`${inputClass} pr-11`}
                  {...register("password", { required: "Password is required" })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">Forgot password?</Link>
            </div>
            <button type="submit" disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 shadow-lg shadow-blue-600/20">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />} Sign In
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-400 font-semibold hover:text-blue-300">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default Login;
