import React, { useState, lazy, Suspense, useEffect, useCallback } from "react";
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

  // Auto-save draft to localStorage
  const watchAll = watch();
  useEffect(() => {
    const draft = { type: watchAll.type, title: watchAll.title, description: watchAll.description, category: watchAll.category, date: watchAll.date, contact: watchAll.contact, location: selectedLocation };
    localStorage.setItem("reportDraft", JSON.stringify(draft));
  }, [watchAll, selectedLocation]);

  useEffect(() => {
    const saved = localStorage.getItem("reportDraft");
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        if (draft.type) setValue("type", draft.type);
        if (draft.title) setValue("title", draft.title);
        if (draft.description) setValue("description", draft.description);
        if (draft.category) setValue("category", draft.category);
        if (draft.date) setValue("date", draft.date);
        if (draft.contact) setValue("contact", draft.contact);
        if (draft.location) setSelectedLocation(draft.location);
      } catch {}
    }
  }, []);

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

  const checkDuplicates = async () => {
    if (!titleWatch || titleWatch.length < 5) return;
    try {
      const allItems = await getAllItems();
      const fakeItem = { title: titleWatch, description: descWatch, type: itemType, category: "", location: selectedLocation };
      const dups = findDuplicates(fakeItem, allItems, 55);
      setDuplicateWarning(dups.length > 0 ? dups[0] : null);
    } catch (e) {
      console.error("Duplicate check failed:", e);
    }
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
      localStorage.removeItem("reportDraft");
      toast.success("Item reported successfully!");
      navigate(data.type === "lost" ? "/items/lost" : "/items/found");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit. Please try again.");
      setUploading(false);
    }
  };

  const inputClass = "w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
  const errorClass = "text-xs text-red-500 mt-1";
  const descLength = descWatch?.length || 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary-50 text-primary-600 p-3 rounded-2xl"><PlusCircle size={22} /></div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Report an Item</h1>
          <p className="text-sm text-gray-500">Help the campus community recover lost belongings</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Type Toggle */}
          <div>
            <label className={labelClass}>Item Type *</label>
            <div className="flex gap-3">
              {["lost", "found"].map(t => (
                <label key={t} className={`flex-1 cursor-pointer border-2 rounded-2xl p-4 text-center font-bold text-sm transition-all ${
                  itemType === t
                    ? t === "lost" ? "border-red-400 bg-red-50 text-red-600" : "border-emerald-400 bg-emerald-50 text-emerald-600"
                    : "border-gray-200 text-gray-400 hover:border-gray-300"
                }`}>
                  <input type="radio" value={t} {...register("type")} className="sr-only" />
                  {t === "lost" ? "🔍 I Lost Something" : "📦 I Found Something"}
                </label>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="report-title" className={labelClass}>Item Title *</label>
            <input id="report-title" type="text" placeholder="e.g. Blue Backpack, Student ID Card"
              className={inputClass} onBlur={checkDuplicates}
              {...register("title", { required: "Title is required", minLength: 3 })} />
            {errors.title && <p className={errorClass}>{errors.title.message}</p>}
          </div>

          {/* Duplicate warning */}
          {duplicateWarning && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-600">Possible Duplicate ({duplicateWarning.score}% match)</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  A similar report already exists:{" "}
                  <a href={`/items/${duplicateWarning.item.id}`} target="_blank" rel="noreferrer" className="text-amber-600 underline">
                    {duplicateWarning.item.title}
                  </a>. Please check before submitting.
                </p>
              </div>
            </div>
          )}

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="report-category" className={labelClass}>Category *</label>
              <select id="report-category" className={inputClass} {...register("category", { required: "Required" })}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className={errorClass}>{errors.category.message}</p>}
            </div>
            <div>
              <label htmlFor="report-date" className={labelClass}>Date {itemType === "lost" ? "Lost" : "Found"} *</label>
              <input id="report-date" type="date" max={new Date().toISOString().split("T")[0]}
                className={inputClass} {...register("date", { required: "Required" })} />
              {errors.date && <p className={errorClass}>{errors.date.message}</p>}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className={labelClass}>Location on Campus *</label>
            <input type="hidden" {...register("location")} />

            <button type="button" onClick={() => setShowMap(!showMap)}
              className={`w-full flex items-center gap-3 border-2 rounded-xl px-4 py-3 text-sm transition-all mb-3 ${
                selectedLocation
                  ? "border-primary-400 bg-primary-50 text-primary-700"
                  : "border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300"
              }`}>
              <MapPin size={16} className={selectedLocation ? "text-primary-500" : "text-gray-400"} />
              {selectedLocation || "Click to pick location on campus map"}
              <span className="ml-auto text-xs text-gray-400">{showMap ? "▲ hide" : "▼ show"} map</span>
            </button>

            <div className="flex flex-wrap gap-2 mb-3">
              {Object.keys(CAMPUS_LOCATIONS).slice(0, 6).map(loc => (
                <button key={loc} type="button" onClick={() => handleLocationSelect(loc)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    selectedLocation === loc
                      ? "border-primary-400 bg-primary-50 text-primary-600"
                      : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}>
                  {loc}
                </button>
              ))}
            </div>

            {showMap && (
              <Suspense fallback={<div className="h-64 bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center text-gray-400 text-sm">Loading map...</div>}>
                <CampusMap
                  selectedLocation={selectedLocation}
                  onLocationSelect={handleLocationSelect}
                  height="280px"
                />
                <p className="text-xs text-gray-400 mt-2">Click a marker or use the quick buttons above to select location</p>
              </Suspense>
            )}
            {!selectedLocation && <p className={errorClass}>Please select a location</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="report-desc" className={labelClass}>Description *</label>
            <textarea id="report-desc" rows={4} onBlur={checkDuplicates}
              placeholder="Describe the item — color, size, brand, distinguishing marks, what was inside..."
              className={`${inputClass} resize-none`}
              {...register("description", { required: "Description is required", minLength: { value: 20, message: "At least 20 characters" } })} />
            <div className="flex justify-between mt-1">
              {errors.description ? <p className={errorClass}>{errors.description.message}</p> : <span />}
              <span className={`text-xs ${descLength < 20 ? "text-gray-400" : "text-emerald-500"}`}>{descLength}/20 min</span>
            </div>
          </div>

          {/* Contact */}
          <div>
            <label htmlFor="report-contact" className={labelClass}>Contact Info</label>
            <input id="report-contact" type="text" placeholder="Phone number or email for others to reach you"
              className={inputClass} {...register("contact")}
              defaultValue={userProfile?.phone || ""} />
          </div>

          {/* Image upload */}
          <div>
            <label className={labelClass}>Photo (optional)</label>
            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="h-40 rounded-xl border border-gray-200 object-cover" />
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-all">
                <Upload size={24} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Click to upload photo</span>
                <span className="text-xs text-gray-400 mt-0.5">PNG, JPG up to 5MB</span>
                <input type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
              </label>
            )}
            {uploading && (
              <div className="mt-2">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">Uploading... {uploadProgress}%</p>
              </div>
            )}
          </div>

          <button type="submit" disabled={isSubmitting || uploading}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-2xl transition-all hover:-translate-y-0.5 disabled:opacity-50 shadow-lg shadow-primary-600/25">
            {(isSubmitting || uploading) && <Loader2 size={16} className="animate-spin" />}
            Report {itemType === "lost" ? "Lost" : "Found"} Item
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportItem;
