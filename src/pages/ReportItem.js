import React, { useState, lazy, Suspense, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { addItem, getRecentItems } from "../firebase/firestore";
import { uploadImageWithThumbnail } from "../firebase/storage";
import { CATEGORIES } from "../utils/helpers";
import { findDuplicates } from "../utils/matching";
import { trackItemReported } from "../utils/logger";
import toast from "react-hot-toast";
import { Upload, X, Loader2, PlusCircle, MapPin, AlertTriangle } from "lucide-react";
import { CAMPUS_LOCATIONS } from "../components/map/CampusMap";

const CampusMap = lazy(() => import("../components/map/CampusMap"));

const STEPS = ["Category", "Details", "Location", "Review"];

const ReportItem = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [showMap, setShowMap] = useState(false);

  const {
    register, handleSubmit, watch, setValue, trigger,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { type: "lost" } });

  const itemType = watch("type");
  const titleWatch = watch("title", "");
  const descWatch = watch("description", "");
  const categoryWatch = watch("category", "");
  const dateWatch = watch("date", "");

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
      const recentItems = await getRecentItems(100);
      const fakeItem = { title: titleWatch, description: descWatch, type: itemType, category: categoryWatch, location: selectedLocation };
      const dups = findDuplicates(fakeItem, recentItems, 55);
      setDuplicateWarning(dups.length > 0 ? dups[0] : null);
    } catch (e) {
      console.error("Duplicate check failed:", e);
    }
  };

  const nextStep = async () => {
    if (step === 0) {
      const valid = await trigger(["type", "category"]);
      if (!valid) return;
    } else if (step === 1) {
      const valid = await trigger(["title", "description"]);
      if (!valid) return;
      checkDuplicates();
    } else if (step === 2) {
      if (!selectedLocation) { toast.error("Please select a location on the map"); return; }
    }
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const onSubmit = async (data) => {
    if (!selectedLocation) { toast.error("Please select a location on the map"); return; }
    try {
      let imageUrl = null, imagePath = null, thumbnailUrl = null;
      if (imageFile) {
        setUploading(true);
        const result = await uploadImageWithThumbnail(imageFile, "tracepoint/items", setUploadProgress);
        imageUrl = result.url; imagePath = result.path; thumbnailUrl = result.thumbnailUrl;
        setUploading(false);
      }
      await addItem({
        ...data, location: selectedLocation, imageUrl, imagePath, thumbnailUrl,
        reportedBy: currentUser.uid,
        reporterName: userProfile?.name || currentUser.displayName,
        reporterContact: data.contact || userProfile?.phone || "",
      });
      localStorage.removeItem("reportDraft");
      trackItemReported(data.category, selectedLocation);
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

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                i === step
                  ? "bg-primary-600 text-white shadow-sm"
                  : i < step
                  ? "bg-primary-50 text-primary-600 cursor-pointer"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                i < step ? "bg-primary-600 text-white" : i === step ? "bg-white text-primary-600" : "bg-gray-200 text-gray-400"
              }`}>{i < step ? "✓" : i + 1}</span>
              <span className="hidden sm:inline">{s}</span>
            </button>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 rounded-full ${i < step ? "bg-primary-300" : "bg-gray-200"}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 0: Category */}
          {step === 0 && (
            <div className="space-y-6">
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
                      {t === "lost" ? "I Lost Something" : "I Found Something"}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="report-category" className={labelClass}>Category *</label>
                <select id="report-category" className={inputClass} {...register("category", { required: "Required" })}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className={errorClass}>{errors.category.message}</p>}
              </div>
            </div>
          )}

          {/* Step 1: Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="report-title" className={labelClass}>Item Title *</label>
                <input id="report-title" type="text" placeholder="e.g. Blue Backpack, Student ID Card"
                  className={inputClass}
                  {...register("title", { required: "Title is required", minLength: 3 })} />
                {errors.title && <p className={errorClass}>{errors.title.message}</p>}
              </div>
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
              <div>
                <label htmlFor="report-desc" className={labelClass}>Description *</label>
                <textarea id="report-desc" rows={4}
                  placeholder="Describe the item — color, size, brand, distinguishing marks, what was inside..."
                  className={`${inputClass} resize-none`}
                  {...register("description", { required: "Description is required", minLength: { value: 20, message: "At least 20 characters" } })} />
                <div className="flex justify-between mt-1">
                  {errors.description ? <p className={errorClass}>{errors.description.message}</p> : <span />}
                  <span className={`text-xs ${descLength < 20 ? "text-gray-400" : "text-emerald-500"}`}>{descLength}/20 min</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Brand (optional)</label>
                  <input type="text" placeholder="e.g. Apple, Samsung" className={inputClass} {...register("brand")} />
                </div>
                <div>
                  <label className={labelClass}>Color (optional)</label>
                  <input type="text" placeholder="e.g. Black, Blue" className={inputClass} {...register("color")} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Unique Marks (optional)</label>
                <input type="text" placeholder="e.g. Sticker on back, scratch near camera" className={inputClass} {...register("uniqueMarks")} />
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-6">
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
              <div>
                <label htmlFor="report-date" className={labelClass}>Date {itemType === "lost" ? "Lost" : "Found"} *</label>
                <input id="report-date" type="date" max={new Date().toISOString().split("T")[0]}
                  className={inputClass} {...register("date", { required: "Required" })} />
                {errors.date && <p className={errorClass}>{errors.date.message}</p>}
              </div>
              <div>
                <label htmlFor="report-contact" className={labelClass}>Contact Info</label>
                <input id="report-contact" type="text" placeholder="Phone number or email for others to reach you"
                  className={inputClass} {...register("contact")}
                  defaultValue={userProfile?.phone || ""} />
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <div className="space-y-6">
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

              {/* Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3">
                <h3 className="font-bold text-gray-900 text-sm">Review Your Report</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-400">Type:</span> <span className="font-medium text-gray-900 capitalize">{itemType}</span></div>
                  <div><span className="text-gray-400">Category:</span> <span className="font-medium text-gray-900">{categoryWatch || "Not set"}</span></div>
                  <div className="col-span-2"><span className="text-gray-400">Title:</span> <span className="font-medium text-gray-900">{titleWatch || "Not set"}</span></div>
                  <div className="col-span-2"><span className="text-gray-400">Location:</span> <span className="font-medium text-gray-900">{selectedLocation || "Not set"}</span></div>
                  <div><span className="text-gray-400">Date:</span> <span className="font-medium text-gray-900">{dateWatch || "Not set"}</span></div>
                  <div><span className="text-gray-400">Image:</span> <span className="font-medium text-gray-900">{imageFile ? "Attached" : "None"}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <button type="button" onClick={prevStep}
                className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={nextStep}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-primary-600/25">
                Continue
              </button>
            ) : (
              <button type="submit" disabled={isSubmitting || uploading}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 shadow-lg shadow-primary-600/25">
                {(isSubmitting || uploading) && <Loader2 size={16} className="animate-spin" />}
                Submit Report
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportItem;
