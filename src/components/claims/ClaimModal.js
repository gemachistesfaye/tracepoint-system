import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { submitClaim, updateItem, addNotification } from "../../firebase/firestore";
import toast from "react-hot-toast";
import { X, Loader2 } from "lucide-react";

const ClaimModal = ({ item, onClose }) => {
  const { currentUser, userProfile } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await submitClaim({
        itemId: item.id,
        itemTitle: item.title,
        claimantId: currentUser.uid,
        claimantName: userProfile?.name || currentUser.displayName,
        claimantEmail: currentUser.email,
        claimantPhone: data.phone,
        proof: data.proof,
        additionalInfo: data.additionalInfo,
      });

      // Update item status
      await updateItem(item.id, { status: "claimed" });

      // Notify the item reporter
      await addNotification(
        item.reportedBy,
        `Someone claimed your ${item.type} item: "${item.title}". Check your claims.`,
        "info"
      );

      toast.success("Claim submitted! The reporter will be notified.");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit claim. Please try again.");
    }
  };

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const errorClass = "text-xs text-red-500 mt-1";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">Claim This Item</h2>
            <p className="text-sm text-gray-500 mt-0.5">"{item.title}"</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
            Please provide proof of ownership. Your claim will be reviewed by the reporter.
          </div>

          <div>
            <label className={labelClass}>Your Phone Number *</label>
            <input
              type="tel"
              placeholder="+251 9XX XXX XXX"
              className={inputClass}
              {...register("phone", { required: "Phone number is required" })}
            />
            {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Proof of Ownership *</label>
            <textarea
              rows={3}
              placeholder="Describe something unique about this item that proves it's yours (serial number, what's inside the bag, special mark, etc.)"
              className={`${inputClass} resize-none`}
              {...register("proof", {
                required: "Proof is required",
                minLength: { value: 20, message: "Please provide more detail" },
              })}
            />
            {errors.proof && <p className={errorClass}>{errors.proof.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Additional Info (optional)</label>
            <textarea
              rows={2}
              placeholder="Any other details you'd like to share"
              className={`${inputClass} resize-none`}
              {...register("additionalInfo")}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              Submit Claim
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimModal;
