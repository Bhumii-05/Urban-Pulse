import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, MapPin, AlertCircle, ChevronRight, CheckCircle2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { citizenService } from "../api/citizen.service";
import { authService } from "../api/auth.service";

import CitizenHeader from "../components/citizen/CitizenHeader";
import CitizenStatsSection from "../components/citizen/CitizenStatsSection";
import CitizenConcernsTable from "../components/citizen/CitizenConcernsTable";
import CitizenSuggestionsList from "../components/citizen/CitizenSuggestionsList";
import SuggestionDrawer from "../components/citizen/SuggestionDrawer";
import ConfirmDeleteDialog from "../components/citizen/ConfirmDeleteDialog";
import FloatingChatbot from "../components/FloatingChatbot";

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.96 }}
          className={`fixed right-4 top-4 z-[1000] flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${
            toast.type === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          )}
          <p className="text-sm font-medium">{toast.message}</p>
          <button onClick={onClose} className="ml-auto shrink-0 text-current/60 hover:opacity-70">
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function CitizenDashboard() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);

  // Stats
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);

  // Concerns
  const [concerns, setConcerns] = useState([]);
  const [concernsLoading, setConcernsLoading] = useState(true);
  const [concernsError, setConcernsError] = useState(null);
  const [concernToDelete, setConcernToDelete] = useState(null);
  const [deletingConcern, setDeletingConcern] = useState(false);

  // Suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [suggestionsError, setSuggestionsError] = useState(null);

  // Suggestion Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState(null);
  const toastIdRef = useRef(0);

  const showToast = useCallback((type, message) => {
    toastIdRef.current += 1;
    setToast({ id: toastIdRef.current, type, message });
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await authService.getCurrentUser();
      if (data) setUserProfile(data);
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    setDashboardLoading(true);
    setDashboardError(null);
    try {
      const data = await citizenService.getDashboardStats();
      setDashboardData(data);
    } catch (err) {
      setDashboardError("Unable to load dashboard data.");
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  const fetchConcerns = useCallback(async () => {
    setConcernsLoading(true);
    setConcernsError(null);
    try {
      const data = await citizenService.getConcerns();
      setConcerns(Array.isArray(data) ? data : []);
    } catch (err) {
      setConcernsError("Unable to load concerns.");
    } finally {
      setConcernsLoading(false);
    }
  }, []);

  const fetchSuggestions = useCallback(async () => {
    setSuggestionsLoading(true);
    setSuggestionsError(null);
    try {
      const data = await citizenService.getSuggestions();
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (err) {
      setSuggestionsError("Unable to load suggestions.");
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchDashboard();
    fetchConcerns();
    fetchSuggestions();
  }, [fetchProfile, fetchDashboard, fetchConcerns, fetchSuggestions]);

  const handleConfirmDelete = async () => {
    if (!concernToDelete) return;
    const targetId = concernToDelete.id || concernToDelete._id;
    setDeletingConcern(true);
    try {
      await citizenService.deleteConcern(targetId);
      setConcerns((prev) => prev.filter((c) => (c.id || c._id) !== targetId));
      setDashboardData((prev) =>
        prev
          ? {
              ...prev,
              total_concerns: Math.max(0, (prev.total_concerns ?? 1) - 1),
              pending_concerns: ["open", "pending"].includes(String(concernToDelete.status).toLowerCase())
                ? Math.max(0, (prev.pending_concerns ?? 1) - 1)
                : prev.pending_concerns,
            }
          : prev,
      );
      showToast("success", "Concern deleted successfully.");
      setConcernToDelete(null);
    } catch (err) {
      showToast("error", "Could not delete this concern.");
    } finally {
      setDeletingConcern(false);
    }
  };

  const handleSubmitSuggestion = async (payload) => {
    setSubmitting(true);
    setFormErrors({});
    try {
      await citizenService.createSuggestion(payload);
      showToast("success", "Suggestion submitted successfully!");
      setDrawerOpen(false);
      fetchSuggestions();
      fetchDashboard();
    } catch (err) {
      if (err?.response?.status === 422) {
        const detail = err.response.data?.detail;
        if (Array.isArray(detail)) {
          const errors = {};
          detail.forEach((item) => {
            const field = item.loc?.[item.loc.length - 1];
            if (field) errors[field] = item.msg;
          });
          setFormErrors(errors);
        }
        showToast("error", "Validation error. Please check your inputs.");
      } else {
        showToast("error", "Could not submit suggestion. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F8F6]">
      <CitizenHeader userProfile={userProfile} />

      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Citizen Dashboard
          </h1>

          <div className="inline-flex w-fit items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <span className="flex items-center gap-2 rounded-lg bg-[#005B4F] px-3.5 py-2 text-sm font-medium text-white">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard View
            </span>
            <button
              type="button"
              onClick={() => {
                setFormErrors({});
                setDrawerOpen(true);
              }}
              className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <MapPin className="h-4 w-4" />
              Suggest Point
            </button>
          </div>
        </div>

        <CitizenStatsSection
          data={dashboardData}
          loading={dashboardLoading}
          error={dashboardError}
          onRetry={fetchDashboard}
        />

        {/* Action Button */}
        <div className="mb-10 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => navigate("/report-concern")}
            className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#005B4F] to-[#00473e] px-7 py-3.5 text-base font-semibold text-white shadow-md transition hover:shadow-lg"
          >
            <AlertCircle className="h-5 w-5 text-emerald-300" />
            Raise Concerns
            <ChevronRight className="h-5 w-5" />
          </motion.button>
        </div>

        <CitizenConcernsTable
          concerns={concerns}
          loading={concernsLoading}
          error={concernsError}
          onRetry={fetchConcerns}
          onSelectDelete={(c) => setConcernToDelete(c)}
        />

        <CitizenSuggestionsList
          suggestions={suggestions}
          loading={suggestionsLoading}
          error={suggestionsError}
          totalCount={dashboardData?.total_suggestions}
          onRetry={fetchSuggestions}
        />
      </main>

      <SuggestionDrawer
        open={drawerOpen}
        onClose={() => !submitting && setDrawerOpen(false)}
        onSubmit={handleSubmitSuggestion}
        submitting={submitting}
        formErrors={formErrors}
      />

      <ConfirmDeleteDialog
        concern={concernToDelete}
        deleting={deletingConcern}
        onCancel={() => !deletingConcern && setConcernToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
      <FloatingChatbot />
    </div>
  );
}