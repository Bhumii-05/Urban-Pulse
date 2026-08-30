import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

import ConcernTypeCard from "../components/report-concern/ConcernTypeCard";
import LocationStatus from "../components/report-concern/LocationStatus";
import EvidenceUploader from "../components/report-concern/EvidenceUploader";
import { useGeolocation } from "../api/useGeolocation";
import { concernService } from "../api/concern.service";
import FloatingChatbot from "../components/FloatingChatbot";

import {
  CONCERN_CATEGORIES,
  PRIORITY_LEVELS,
  DEFAULT_PRIORITY,
  getCategoryLabel,
  getPriorityLabel,
} from "../api/concernConfig";

const DEFAULT_COORDINATES = { latitude: 22.5726, longitude: 88.3639 };

const STAGE = {
  IDLE: "idle",
  CREATING: "creating",
  UPLOADING: "uploading",
  SUCCESS: "success",
  CREATE_ERROR: "create_error",
  IMAGE_ERROR: "image_error",
};

function extractErrorMessage(
  error,
  fallback = "Unable to submit concern. Please try again.",
) {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((item) =>
        typeof item === "string" ? item : item.msg || item.message,
      )
      .filter(Boolean)
      .join(". ");
  }
  if (typeof detail === "object" && detail !== null) {
    return detail.msg || detail.message || JSON.stringify(detail);
  }
  return error?.message || fallback;
}

function parseCoordinates(loc) {
  if (!loc) return DEFAULT_COORDINATES;
  const rawLat = loc.latitude ?? loc.lat ?? loc.coords?.latitude;
  const rawLng = loc.longitude ?? loc.lng ?? loc.coords?.longitude;

  if (rawLat != null && rawLng != null) {
    const lat = Number(rawLat);
    const lng = Number(rawLng);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      return { latitude: lat, longitude: lng };
    }
  }
  return DEFAULT_COORDINATES;
}

function formatLocationText(loc) {
  if (!loc) return "—";
  if (typeof loc === "string") return loc;
  const lat = loc.latitude ?? loc.lat;
  const lng = loc.longitude ?? loc.lng;
  if (lat != null && lng != null) {
    return `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;
  }
  return "Coordinates recorded";
}

export default function ReportConcern() {
  const geo = useGeolocation();

  const [category, setCategory] = useState(CONCERN_CATEGORIES[0]?.value || "");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(DEFAULT_PRIORITY);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [evidenceError, setEvidenceError] = useState(null);

  const [stage, setStage] = useState(STAGE.IDLE);
  const [formError, setFormError] = useState(null);
  const [concern, setConcern] = useState(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const isSubmitting = stage === STAGE.CREATING || stage === STAGE.UPLOADING;

  const handleEvidenceChange = (selected, validationError) => {
    if (validationError) {
      setEvidenceError(validationError);
      return;
    }
    setEvidenceError(null);
    setSelectedFile(selected);
  };

  const resetForm = () => {
    setCategory(CONCERN_CATEGORIES[0]?.value || "");
    setDescription("");
    setPriority(DEFAULT_PRIORITY);
    setSelectedFile(null);
    setEvidenceError(null);
    setStage(STAGE.IDLE);
    setFormError(null);
    setConcern(null);
  };

  const runImageUpload = async (concernId, file) => {
    if (!file) {
      setStage(STAGE.SUCCESS);
      return;
    }
    setStage(STAGE.UPLOADING);
    try {
      await concernService.uploadConcernImage(concernId, file);
      setStage(STAGE.SUCCESS);
    } catch {
      setStage(STAGE.IMAGE_ERROR);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (stage === STAGE.IMAGE_ERROR && concern) {
      const concernId = concern.id || concern._id;
      await runImageUpload(concernId, selectedFile);
      return;
    }

    setFormError(null);

    if (!category) {
      setFormError("Please select a concern category.");
      return;
    }
    if (!description.trim()) {
      setFormError("Please describe the issue.");
      return;
    }
    if (!selectedFile) {
      setEvidenceError("Must upload evidence photo.");
      return;
    }

    const coords = parseCoordinates(geo.coords || geo.location);

    setStage(STAGE.CREATING);
    let created = null;

    const payload = {
      category: String(category),
      description: description.trim(),
      location: {
        latitude: Number(coords.latitude),
        longitude: Number(coords.longitude),
      },
      priority: String(priority).toLowerCase(),
    };

    try {
      created = await concernService.createConcern(payload);
      setConcern(created);
    } catch (err) {
      setStage(STAGE.CREATE_ERROR);
      setFormError(extractErrorMessage(err));
      return;
    }

    const createdId = created?.id || created?._id;
    if (createdId && selectedFile) {
      await runImageUpload(createdId, selectedFile);
    } else {
      setStage(STAGE.SUCCESS);
    }
  };

  const submitLabel = useMemo(() => {
    if (stage === STAGE.CREATING) return "Creating Concern...";
    if (stage === STAGE.UPLOADING) return "Uploading Evidence...";
    if (stage === STAGE.SUCCESS) return "Concern Submitted ✓";
    if (stage === STAGE.IMAGE_ERROR) return "Retry Evidence Upload";
    return "Submit Concern";
  }, [stage]);

  if (stage === STAGE.SUCCESS && concern) {
    const concernId = concern.id || concern._id;
    return (
      <div className="min-h-screen bg-[#EAF7F0]">
        <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center">
          <div className="w-full rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-2xl font-semibold text-slate-900">
              Concern Submitted Successfully!
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Thank you for helping keep your community clean. Our team has been
              notified.
            </p>

            <dl className="mt-6 space-y-2 rounded-2xl bg-slate-50 p-4 text-left text-sm">
              <Row label="Concern ID" value={`#${concernId}`} />
              <Row
                label="Category"
                value={getCategoryLabel(concern.category)}
              />
              <Row
                label="Priority"
                value={getPriorityLabel(concern.priority)}
              />
              <Row
                label="Location"
                value={formatLocationText(concern.location)}
              />
              <Row label="Evidence" value="Uploaded ✓" />
              <Row label="Status" value="Open" />
            </dl>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 rounded-xl border border-emerald-600 px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
              >
                Report Another Concern
              </button>
              <Link
                to="/citizen"
                className="flex-1 rounded-xl bg-[#005B4F] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#00473e]"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#EAF7F0]">
      <main className="relative mx-auto max-w-3xl px-4 py-12">
        <header className="relative mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[#0FA968] shadow-[0_0_0_4px_rgba(15,169,104,0.12)]" />
            Citizen Reporting
          </div>

          <h1 className="whitespace-nowrap text-3xl font-bold tracking-tight text-[#123B35] sm:text-4xl lg:text-[52px]">
            Report a{" "}
            <span className="bg-gradient-to-r from-[#078F68] to-[#61B946] bg-clip-text text-transparent">
              Waste-Related
            </span>{" "}
            Concern
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
            Help us keep our streets clean, safe, and sustainable. Report waste
            issues in your community and help our team take action.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-3xl border border-white/60 bg-white/70 p-5 shadow-[0_10px_40px_-15px_rgba(15,61,46,0.25)] backdrop-blur sm:p-8"
        >
          <fieldset>
            <legend className="mb-3 text-sm font-medium text-slate-700">
              Concern Category
            </legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CONCERN_CATEGORIES.map((c) => (
                <ConcernTypeCard
                  key={c.value}
                  category={c}
                  selected={category === c.value}
                  onSelect={setCategory}
                />
              ))}
            </div>
          </fieldset>

          <LocationStatus
            status={geo.status}
            location={geo.location}
            errorMessage={geo.errorMessage}
            onRetry={geo.retry}
          />

          <div>
            <h2 className="mb-2 text-sm font-medium text-slate-700">
              Evidence Upload
            </h2>
            <EvidenceUploader
              file={selectedFile}
              previewUrl={previewUrl}
              onFileSelect={handleEvidenceChange}
              onRemove={() => setSelectedFile(null)}
              error={evidenceError}
            />
          </div>

          <div>
            <label
              htmlFor="concern-description"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Provide Landmarks and Issue Details
            </label>
            <textarea
              id="concern-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the waste-related issue, nearby landmark, or any other useful information..."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-slate-700">
              Priority
            </legend>
            <div className="flex gap-2">
              {PRIORITY_LEVELS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  aria-pressed={priority === p.value}
                  onClick={() => setPriority(p.value)}
                  className={`flex-1 rounded-xl border-2 px-3 py-2 text-sm font-medium transition-colors ${
                    priority === p.value
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 text-slate-600 hover:border-emerald-200"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </fieldset>

          {formError && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700"
            >
              {formError}
            </p>
          )}

          {stage === STAGE.IMAGE_ERROR && (
            <p
              role="alert"
              className="rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800"
            >
              Concern created, but evidence upload failed. Your concern (#
              {concern?.id || concern?._id}) was saved — use the button below to
              retry the photo upload.
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#005B4F] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#00473e] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            {submitLabel}
            {!isSubmitting && stage === STAGE.IDLE && (
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </form>
      </main>

      <FloatingChatbot />
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-800">{value}</dd>
    </div>
  );
}
