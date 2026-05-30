import React, { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { addItem, getAllItems } from "../firebase/firestore";
import { uploadImage } from "../firebase/storage";
import { CATEGORIES } from "../utils/helpers";
import { findDuplicates } from "../utils/matching";
import toast from "react-hot-toast";
import { Upload, X, Loader2, PlusCircle, MapPin, AlertTriangle } from "lucide-react";
import { CAMPUS_LOCATIONS } from "../components/map/CampusMap";

const CampusMap = lazy(() => import("../components/map/CampusMap"));

const ReportItem = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [showMap, setShowMap] = useState(false);

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { type: "lost" } });

  const itemType = watch("type");
  const titleWatch = watch("title", "");
  const descWatch = watch("description", "");

  const handleLocationSelect = (loc) => {
    setSelectedLocation(loc);
    setValue("location", loc);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Check for duplicates on blur
  const checkDuplicates = async () => {
    if (!titleWatch || titleWatch.length < 5) return;
    try {
      const allItems = await getAllItems();
      const fakeItem = { title: titleWatch, description: descWatch, type: itemType, category: "", location: selectedLocation };
      const dups = findDuplicates(fakeItem, allItems, 55);
      setDuplicateWarning(dups.length > 0 ? dups[0] : null);
    } catch (e) {}
  };

  const onSubmit = async (data) => {
    if (!selectedLocation) { toast.error("Please select a location on the map"); return; }
    try {
      let imageUrl = null, imagePath = null;
      if (imageFile) {
        setUploading(true);
        const result = await uploadImage(imageFile, "tracepoint/items", setUploadProgress);
        imageUrl = result.url; imagePath = result.path;
        setUploading(false);
      }
      await addItem({
        ...data, location: selectedLocation, imageUrl, imagePath,
        reportedBy: currentUser.uid,
        reporterName: userProfile?.name || currentUser.displayName,
        reporterContact: data.contact || userProfile?.phone || "",
      });
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
          <p className="text-sm text-slate-400">Help the campus community recover lost belongings</p>
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

          {/* Title */}
          <div>
            <label className={labelClass}>Item Title *</label>
            <input type="text" placeholder="e.g. Blue Backpack, Student ID Card"
              className={inputClass} onBlur={checkDuplicates}
              {...register("title", { required: "Title is required", minLength: 3 })} />
            {errors.title && <p className={errorClass}>{errors.title.message}</p>}
          </div>

          {/* Duplicate warning */}
          {duplicateWarning && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-yellow-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-yellow-400">Possible Duplicate ({duplicateWarning.score}% match)</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  A similar report already exists:{" "}
                  <a href={`/items/${duplicateWarning.item.id}`} target="_blank" rel="noreferrer" className="text-yellow-400 underline">
                    {duplicateWarning.item.title}
                  </a>. Please check before submitting.
                </p>
              </div>
            </div>
          )}

          {/* Category & Date */}
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
              <label className={labelClass}>Date {itemType === "lost" ? "Lost" : "Found"} *</label>
              <input type="date" max={new Date().toISOString().split("T")[0]}
                className={inputClass} {...register("date", { required: "Required" })} />
              {errors.date && <p className={errorClass}>{errors.date.message}</p>}
            </div>
          </div>

          {/* Location — map picker */}
          <div>
            <label className={labelClass}>Location on Campus *</label>
            <input type="hidden" {...register("location")} />

            {/* Selected location display */}
            <button type="button" onClick={() => setShowMap(!showMap)}
              className={`w-full flex items-center gap-3 border rounded-xl px-4 py-3 text-sm transition-all mb-3 ${
                selectedLocation
                  ? "border-blue-500/40 bg-blue-500/5 text-white"
                  : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
              }`}>
              <MapPin size={16} className={selectedLocation ? "text-blue-400" : "text-slate-500"} />
              {selectedLocation || "Click to pick location on campus map"}
              <span className="ml-auto text-xs text-slate-500">{showMap ? "▲ hide" : "▼ show"} map</span>
            </button>

            {/* Quick location buttons */}
            <div className="flex flex-wrap gap-2 mb-3">
              {Object.keys(CAMPUS_LOCATIONS).slice(0, 6).map(loc => (
                <button key={loc} type="button" onClick={() => handleLocationSelect(loc)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    selectedLocation === loc
                      ? "border-blue-500 bg-blue-500/15 text-blue-400"
                      : "border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
                  }`}>
                  {loc}
                </button>
              ))}
            </div>

            {/* Map */}
            {showMap && (
              <Suspense fallback={<div className="h-64 bg-white/5 rounded-2xl animate-pulse flex items-center justify-center text-slate-500 text-sm">Loading map...</div>}>
                <CampusMap
                  selectedLocation={selectedLocation}
                  onLocationSelect={handleLocationSelect}
                  height="280px"
                />
                <p className="text-xs text-slate-500 mt-2">Click a marker or use the quick buttons above to select location</p>
              </Suspense>
            )}
            {!selectedLocation && <p className={errorClass}>Please select a location</p>}
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description *</label>
            <textarea rows={4} onBlur={checkDuplicates}
              placeholder="Describe the item — color, size, brand, distinguishing marks, what was inside..."
              className={`${inputClass} resize-none`}
              {...register("description", { required: "Description is required", minLength: { value: 20, message: "At least 20 characters" } })} />
            {errors.description && <p className={errorClass}>{errors.description.message}</p>}
          </div>

          {/* Contact */}
          <div>
            <label className={labelClass}>Contact Info</label>
            <input type="text" placeholder="Phone number or email for others to reach you"
              className={inputClass} {...register("contact")}
              defaultValue={userProfile?.phone || ""} />
          </div>

          {/* Image upload */}
          <div>
            <label className={labelClass}>Photo (optional)</label>
            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="h-40 rounded-xl border border-white/10 object-cover" />
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-blue-500/40 hover:bg-blue-500/5 transition-all">
                <Upload size={24} className="text-slate-500 mb-2" />
                <span className="text-sm text-slate-500">Click to upload photo</span>
                <span className="text-xs text-slate-600 mt-0.5">PNG, JPG up to 5MB</span>
                <input type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
              </label>
            )}
            {uploading && (
              <div className="mt-2">
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
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
