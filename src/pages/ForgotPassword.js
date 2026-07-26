import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { MapPin, Loader2, ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async ({ email }) => {
    try { await resetPassword(email); setSent(true); toast.success("Reset email sent!"); }
    catch { toast.error("Could not send reset email."); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 text-white rounded-2xl mb-4 shadow-lg shadow-primary-600/30">
            <MapPin size={26} />
          </div>
          <h1 className="text-2xl font-black text-gray-900">TracePoint</h1>
        </div>
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          {sent ? (
            <div className="text-center">
              <div className="text-5xl mb-4">📧</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-sm text-gray-500 mb-6">We've sent a password reset link to your inbox.</p>
              <Link to="/login" className="text-primary-600 font-medium text-sm hover:text-primary-700 flex items-center justify-center gap-1">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Reset your password</h2>
              <p className="text-sm text-gray-500 mb-6">Enter your email and we'll send a reset link.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input id="reset-email" type="email" placeholder="you@haramaya.edu.et"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    {...register("email", { required: true })} />
                </div>
                <button type="submit" disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-primary-600/25">
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />} Send Reset Link
                </button>
              </form>
              <Link to="/login" className="mt-4 text-center block text-primary-600 text-sm hover:text-primary-700 flex items-center justify-center gap-1">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default ForgotPassword;
