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
      await submitClaim({ itemId: item.id, itemTitle: item.title, itemType: item.type,
        claimantId: currentUser.uid,
        claimantName: userProfile?.name || currentUser.displayName,
        claimantEmail: currentUser.email, claimantPhone: data.phone,
        proof: data.proof, additionalInfo: data.additionalInfo });
      await updateItem(item.id, { status: "claimed" }, item.type);
      await addNotification(item.reportedBy, `Someone claimed your ${item.type} item: "${item.title}". Check your claims.`, "info");
      toast.success("Claim submitted! The reporter will be notified.");
      onClose();
    } catch (err) {
      toast.error("Failed to submit claim.");
    }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">Claim This Item</h2>
            <p className="text-sm text-gray-500 mt-0.5">"{item.title}"</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="flex items-start gap-3 bg-primary-50 border border-primary-100 rounded-xl p-3 text-sm text-primary-700">
            <Shield size={16} className="mt-0.5 shrink-0" />
            Provide proof of ownership. Your claim will be reviewed by an admin.
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Your Phone Number *</label>
            <input type="tel" placeholder="+251 9XX XXX XXX" className={inputClass}
              {...register("phone", { required: "Phone number is required" })} />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">What color is the item? *</label>
            <input type="text" placeholder="e.g. Black, Blue with white stripes" className={inputClass}
              {...register("itemColor", { required: "Color is required" })} />
            {errors.itemColor && <p className="text-xs text-red-500 mt-1">{errors.itemColor.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Any stickers or unique marks?</label>
            <input type="text" placeholder="e.g. Sticker on back, scratch near camera" className={inputClass}
              {...register("uniqueMarks")} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Brand or model?</label>
            <input type="text" placeholder="e.g. Apple, Samsung Galaxy S21" className={inputClass}
              {...register("brand")} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Proof of Ownership *</label>
            <textarea rows={3} placeholder="Describe something unique about this item that proves it's yours..."
              className={`${inputClass} resize-none`}
              {...register("proof", { required: "Proof is required", minLength: { value: 20, message: "Please provide more detail" } })} />
            {errors.proof && <p className="text-xs text-red-500 mt-1">{errors.proof.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Additional Info (optional)</label>
            <textarea rows={2} placeholder="Any other details..." className={`${inputClass} resize-none`}
              {...register("additionalInfo")} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50">
              {isSubmitting && <Loader2 size={14} className="animate-spin" />} Submit Claim
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ClaimModal;
