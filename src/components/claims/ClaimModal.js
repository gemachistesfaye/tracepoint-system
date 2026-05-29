import React from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { submitClaim, updateItem, addNotification } from "../../firebase/firestore";
import toast from "react-hot-toast";
import { X, Loader2, Shield } from "lucide-react";

const ClaimModal = ({ item, onClose }) => {
  const { currentUser, userProfile } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await submitClaim({ itemId: item.id, itemTitle: item.title, claimantId: currentUser.uid,
        claimantName: userProfile?.name || currentUser.displayName,
        claimantEmail: currentUser.email, claimantPhone: data.phone,
        proof: data.proof, additionalInfo: data.additionalInfo });
      await updateItem(item.id, { status: "claimed" });
      await addNotification(item.reportedBy, `Someone claimed your ${item.type} item: "${item.title}". Check your claims.`, "info");
      toast.success("Claim submitted! The reporter will be notified.");
      onClose();
    } catch (err) {
      toast.error("Failed to submit claim.");
    }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f1629] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/8">
          <div>
            <h2 className="font-bold text-white">Claim This Item</h2>
            <p className="text-sm text-slate-400 mt-0.5">"{item.title}"</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-sm text-blue-300">
            <Shield size={16} className="mt-0.5 shrink-0" />
            Provide proof of ownership. Your claim will be reviewed by an admin.
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Your Phone Number *</label>
            <input type="tel" placeholder="+251 9XX XXX XXX" className={inputClass}
              {...register("phone", { required: "Phone number is required" })} />
            {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Proof of Ownership *</label>
            <textarea rows={3} placeholder="Describe something unique about this item that proves it's yours..."
              className={`${inputClass} resize-none`}
              {...register("proof", { required: "Proof is required", minLength: { value: 20, message: "Please provide more detail" } })} />
            {errors.proof && <p className="text-xs text-red-400 mt-1">{errors.proof.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Additional Info (optional)</label>
            <textarea rows={2} placeholder="Any other details..." className={`${inputClass} resize-none`}
              {...register("additionalInfo")} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 border border-white/10 text-slate-400 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50">
              {isSubmitting && <Loader2 size={14} className="animate-spin" />} Submit Claim
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ClaimModal;
