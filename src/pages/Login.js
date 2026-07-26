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

  const inputClass = "w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all";

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="relative max-w-md mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-8 transition-colors group">
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          Back to website
        </Link>
      </div>

      <div className="relative flex flex-col items-center justify-center" style={{ minHeight: "calc(100vh - 80px)" }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 text-white rounded-2xl mb-4 shadow-lg shadow-primary-600/30">
              <MapPin size={26} />
            </div>
            <h1 className="text-2xl font-black text-gray-900">HU Lost & Found</h1>
            <p className="text-sm text-gray-500 mt-1">Haramaya University Lost & Found</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Sign in to your account</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input id="email" type="email" placeholder="you@haramaya.edu.et" className={inputClass}
                  {...register("email", { required: "Email is required" })} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                    className={`${inputClass} pr-11`}
                    {...register("password", { required: "Password is required" })} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <button type="submit" disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 shadow-lg shadow-primary-600/25">
                {isSubmitting && <Loader2 size={16} className="animate-spin" />} Sign In
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
