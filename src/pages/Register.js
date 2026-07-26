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
          <h1 className="text-2xl font-black text-gray-900">TracePoint</h1>
          <p className="text-sm text-gray-500 mt-1">Haramaya University Lost & Found</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Create your account</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className={labelClass}>Full Name *</label>
              <input id="name" type="text" placeholder="Gemachi Tesfaye" className={inputClass}
                {...register("name", { required: "Full name is required" })} />
              {errors.name && <p className={errorClass}>{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="reg-email" className={labelClass}>Email Address *</label>
              <input id="reg-email" type="email" placeholder="you@haramaya.edu.et" className={inputClass}
                {...register("email", { required: "Email is required" })} />
              {errors.email && <p className={errorClass}>{errors.email.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="studentId" className={labelClass}>Student ID</label>
                <input id="studentId" type="text" placeholder="HU/XXXX/XX" className={inputClass} {...register("studentId")} />
              </div>
              <div>
                <label htmlFor="phone" className={labelClass}>Phone</label>
                <input id="phone" type="tel" placeholder="+251 9XX XXX XXX" className={inputClass}
                  {...register("phone", { pattern: { value: /^\+?[\d\s-]{7,15}$/, message: "Invalid phone number" } })} />
                {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
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
