import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { addItem } from "../../firebase/firestore";
import { uploadImage } from "../../firebase/storage";
import { CATEGORIES, LOCATIONS } from "../../utils/helpers";
import toast from "react-hot-toast";
import { Upload, X, Loader2 } from "lucide-react";

const ReportItemForm = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { type: "lost" } });

  const itemType = watch("type");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    try {
      let imageUrl = null;
      let imagePath = null;

      if (imageFile) {
        setUploading(true);
        const result = await uploadImage(imageFile, "items", setUploadProgress);
        imageUrl = result.url;
        imagePath = result.path;
        setUploading(false);
      }

      await addItem({
        ...data,
        imageUrl,
        imagePath,
        reportedBy: currentUser.uid,
        reporterName: userProfile?.name || currentUser.displayName,
        reporterContact: data.contact || userProfile?.phone || "",
      });

      toast.success("Item reported successfully!");
      navigate(data.type === "lost" ? "/items/lost" : "/items/found");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit. Please try again.");
    }
  };

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const errorClass = "text-xs text-red-500 mt-1";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className={labelClass}>Item Type *</label>
        <div className="flex gap-3">
          {["lost", "found"].map((t) => (
            <label
              key={t}
              className={`flex-1 cursor-pointer border-2 rounded-xl p-4 text-center font-semibold text-sm transition-all ${
                itemType === t
                  ? t === "lost"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              <input type="radio" value={t} {...register("type", { required: true })} className="sr-only" />
              {t === "lost" ? "I Lost Something" : "I Found Something"}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>Item Title *</label>
        <input type="text" placeholder="e.g. Blue Backpack, Student ID Card" className={inputClass}
          {...register("title", { required: "Title is required", minLength: 3 })} />
        {errors.title && <p className={errorClass}>{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Category *</label>
          <select className={inputClass} {...register("category", { required: "Category is required" })}>
            <option value="">Select category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p className={errorClass}>{errors.category.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Location *</label>
          <select className={inputClass} {...register("location", { required: "Location is required" })}>
            <option value="">Where was it {itemType}?</option>
            {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          {errors.location && <p className={errorClass}>{errors.location.message}</p>}
        </div>
      </div>

      <div>
        <label className={labelClass}>Date {itemType === "lost" ? "Lost" : "Found"} *</label>
        <input type="date" max={new Date().toISOString().split("T")[0]} className={inputClass}
          {...register("date", { required: "Date is required" })} />
        {errors.date && <p className={errorClass}>{errors.date.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Description *</label>
        <textarea rows={4} placeholder="Describe the item in detail — color, size, brand, distinguishing marks..."
          className={`${inputClass} resize-none`}
          {...register("description", { required: "Description is required", minLength: { value: 20, message: "Please provide at least 20 characters" } })} />
        {errors.description && <p className={errorClass}>{errors.description.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Contact Info</label>
        <input type="text" placeholder="Phone number or email for others to reach you" className={inputClass}
          {...register("contact")} defaultValue={userProfile?.phone || ""} />
      </div>

      <div>
        <label className={labelClass}>Photo (optional)</label>
        {imagePreview ? (
          <div className="relative inline-block">
            <img src={imagePreview} alt="Preview" className="h-40 rounded-lg border border-gray-200 object-cover" />
            <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5">
              <X size={14} />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-colors">
            <Upload size={24} className="text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Click to upload photo</span>
            <span className="text-xs text-gray-400">PNG, JPG up to 5MB</span>
            <input type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
          </label>
        )}
        {uploading && (
          <div className="mt-2">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-1">Uploading... {uploadProgress}%</p>
          </div>
        )}
      </div>

      <button type="submit" disabled={isSubmitting || uploading}
        className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white font-semibold py-3 rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {(isSubmitting || uploading) && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? "Submitting..." : `Report ${itemType === "lost" ? "Lost" : "Found"} Item`}
      </button>
    </form>
  );
};

export default ReportItemForm;
