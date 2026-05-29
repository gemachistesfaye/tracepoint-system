import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { addItem } from "../firebase/firestore";
import { uploadImage } from "../firebase/storage";
import { CATEGORIES, LOCATIONS } from "../utils/helpers";
import toast from "react-hot-toast";
import { Upload, X, Loader2, PlusCircle } from "lucide-react";

const ReportItem = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({ defaultValues: { type: "lost" } });
  const itemType = watch("type");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    try {
      let imageUrl = null, imagePath = null;
      if (imageFile) {
        setUploading(true);
        const result = await uploadImage(imageFile, "tracepoint/items", setUploadProgress);
        imageUrl = result.url; imagePath = result.path;
        setUploading(false);
      }
      await addItem({ ...data, imageUrl, imagePath, reportedBy: currentUser.uid,
        reporterName: userProfile?.name || currentUser.displayName,
        reporterContact: data.contact || userProfile?.phone || "" });
      toast.success("Item reported successfully!");
      navigate(data.type === "lost" ? "/items/lost" : "/items/found");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit. Please try again.");
      setUploading(false);
    }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";
  const labelClass = "block text-sm font-medium text-slate-400 mb-1.5";
  const errorClass = "text-xs text-red-400 mt-1";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-600/20 text-blue-400 p-3 rounded-2xl"><PlusCircle size={22} /></div>
        <div>
          <h1 className="text-2xl font-black text-white">Report an Item</h1>
          <p className="text-sm text-slate-400">Fill in the details to submit your report</p>
        </div>
      </div>

      <div className="bg-white/3 border border-white/10 rounded-3xl p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Type Toggle */}
          <div>
            <label className={labelClass}>Item Type *</label>
            <div className="flex gap-3">
              {["lost", "found"].map(t => (
                <label key={t} className={`flex-1 cursor-pointer border-2 rounded-2xl p-4 text-center font-bold text-sm transition-all ${
                  itemType === t
                    ? t === "lost" ? "border-red-500 bg-red-500/10 text-red-400" : "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                    : "border-white/10 text-slate-500 hover:border-white/20"
                }`}>
                  <input type="radio" value={t} {...register("type")} className="sr-only" />
                  {t === "lost" ? "🔍 I Lost Something" : "📦 I Found Something"}
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
              <select className={inputClass} {...register("category", { required: "Required" })}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className={errorClass}>{errors.category.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Location *</label>
              <select className={inputClass} {...register("location", { required: "Required" })}>
                <option value="">Where was it {itemType}?</option>
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
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
              {...register("description", { required: "Description is required", minLength: { value: 20, message: "At least 20 characters" } })} />
            {errors.description && <p className={errorClass}>{errors.description.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Contact Info</label>
            <input type="text" placeholder="Phone number or email" className={inputClass}
              {...register("contact")} defaultValue={userProfile?.phone || ""} />
          </div>

          {/* Image Upload */}
          <div>
            <label className={labelClass}>Photo (optional)</label>
            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="h-40 rounded-xl border border-white/10 object-cover" />
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-blue-500/40 hover:bg-blue-500/5 transition-all">
                <Upload size={24} className="text-slate-500 mb-2" />
                <span className="text-sm text-slate-500">Click to upload photo</span>
                <span className="text-xs text-slate-600">PNG, JPG up to 5MB</span>
                <input type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
              </label>
            )}
            {uploading && (
              <div className="mt-2">
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">Uploading... {uploadProgress}%</p>
              </div>
            )}
          </div>

          <button type="submit" disabled={isSubmitting || uploading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-2xl transition-all hover:-translate-y-0.5 disabled:opacity-50 shadow-lg shadow-blue-600/20">
            {(isSubmitting || uploading) && <Loader2 size={16} className="animate-spin" />}
            Report {itemType === "lost" ? "Lost" : "Found"} Item
          </button>
        </form>
      </div>
    </div>
  );
};
export default ReportItem;
