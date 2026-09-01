import React, { useState, useEffect, useRef, useCallback } from "react";
import { authService } from "../api/auth.service";
import { analyticsService } from "../api/analytics.service";
import { coordsToLocationString } from "../api/location.service";

// Common UI Primitives
import { Toast } from "../components/common/CommonUI";
import FloatingChatbot from "../components/FloatingChatbot";

// Top Layout & Navigation
import AdminHeader from "../components/admin/AdminHeader";
import NavigationTabs from "../components/admin/NavigationTabs";
import AnalyticsSection from "../components/admin/AnalyticsSection";

// Tab Sub-Components
import UserManagement from "../components/admin/users/UserManagement";
import ConcernManagement from "../components/admin/concerns/ConcernManagement";
import RouteManagement from "../components/admin/routes/RouteManagement";
import SuggestionManagement from "../components/admin/suggestions/SuggestionManagement";
import WasteBinManagement from "../components/admin/bins/WasteBinManagement";

const BACKGROUND_IMAGE_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5Ojf/2wBDAQoKCg0MDRoPDxo3JR8lNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzf/wAARCAONBkADASIAAhEBAxEB/8QAGwABAQADAQEBAAAAAAAAAAAAAAECAwQFBgf/xABCEAEAAgIBAgQEAwYDCAICAAcAAQIDEQQSIQUxQVETImFxMoGRBhQjQlJwM6GxFSRDYoKSwdE0RFNUc+EWJWOi8P/EABoBAQEBAQEBAQAAAAAAAAAAAAABAgMEBQb/xAAvEQEBAAIBAwQCAgEEAQUBAAAAAQIRAxIhMQQTQVEUMiJhBSNScYFCkpMH/xAAAEAEBAQEBAAAAAAAAAAAAAAABAhEAMf/aAAwDAQACEAMBB4A3YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/Z";

export default function AdminDashboard() {
  // Navigation State
  const [activeTab, setActiveTab] = useState("users");
  const [adminUser, setAdminUser] = useState({ name: "Admin", role: "Admin" });

  // Shared Toast State
  const [toastMessage, setToastMessage] = useState("");
  const toastTimer = useRef(null);

  const fireToast = useCallback((message) => {
    if (!message) return;
    setToastMessage(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(""), 2400);
  }, []);

  // Shared Analytics State
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalWorkers: 0,
    pendingConcerns: 0,
    resolvedConcerns: 0,
    completedRoutes: 0,
  });

  // Cross-Module Draft Point State (for importing from Concerns/Suggestions)
  const [importedPointTarget, setImportedPointTarget] = useState(null);

  // Fetch Analytics Summary
  const fetchAnalyticsOverview = useCallback(async () => {
    try {
      const data = await analyticsService.getOverview();
      if (data) {
        setAnalytics({
          totalUsers: data.total_users ?? data.totalUsers ?? 0,
          totalWorkers: data.total_workers ?? data.totalWorkers ?? 0,
          pendingConcerns: data.pending_concerns ?? data.pendingConcerns ?? 0,
          resolvedConcerns:
            data.resolved_concerns ?? data.resolvedConcerns ?? 0,
          completedRoutes: data.completed_routes ?? data.completedRoutes ?? 0,
        });
      }
    } catch (err) {
      console.error("Failed to load analytics overview", err);
    }
  }, []);

  // Fetch Current Admin User
  useEffect(() => {
    const initDashboard = async () => {
      try {
        const currentUserData = await authService.getCurrentUser();
        if (currentUserData) {
          setAdminUser({
            name: currentUserData.full_name || currentUserData.name || "Admin",
            role: currentUserData.role
              ? currentUserData.role.charAt(0).toUpperCase() +
                currentUserData.role.slice(1).toLowerCase()
              : "Admin",
          });
        }
      } catch (err) {
        console.error("Failed to load admin profile:", err);
      }
      fetchAnalyticsOverview();
    };

    initDashboard();
  }, [fetchAnalyticsOverview]);

  // Handle Import Location to Route from Concerns or Suggestions
  const handleImportToRoute = (title, locationCoords) => {
    if (!locationCoords || (!locationCoords.lat && !locationCoords.latitude)) {
      fireToast("Invalid coordinates on this report.");
      return;
    }

    const lat = locationCoords.latitude ?? locationCoords.lat;
    const lng = locationCoords.longitude ?? locationCoords.lng;

    setImportedPointTarget({
      name: title,
      latitude: String(Number(lat).toFixed(6)),
      longitude: String(Number(lng).toFixed(6)),
    });

    setActiveTab("routes");
    fireToast(`Location drafted to active route builder!`);
  };

  return (
    <div className="min-h-screen w-full relative font-sans text-[#123B2E] overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        .font-sans { font-family: 'Manrope', ui-sans-serif, system-ui, sans-serif; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        .animate-scaleIn { animation: scaleIn 0.18s ease-out; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Fixed Background Image and Overlay */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat bg-[#eaf4ee]"
        style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})` }}
      />
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-white/10 via-white/30 to-white/60" />

      {/* 1. Header Navbar */}
      <AdminHeader adminUser={adminUser} />

      {/* 2. Top Navigation Selection Cards */}
      <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 3. Main Dynamic Module Display */}
      <main className="max-w-7xl mx-auto px-6 pt-8 pb-8">
        {activeTab === "users" && (
          <UserManagement fireToast={fireToast} />
        )}

        {activeTab === "concerns" && (
          <ConcernManagement
            fireToast={fireToast}
            onImportToRoute={handleImportToRoute}
            refreshAnalytics={fetchAnalyticsOverview}
          />
        )}

        {activeTab === "routes" && (
          <RouteManagement
            fireToast={fireToast}
            importedPointTarget={importedPointTarget}
            clearImportedPoint={() => setImportedPointTarget(null)}
            refreshAnalytics={fetchAnalyticsOverview}
          />
        )}

        {activeTab === "suggestions" && (
          <SuggestionManagement
            fireToast={fireToast}
            onImportToRoute={handleImportToRoute}
          />
        )}

        {activeTab === "bins" && (
          <WasteBinManagement fireToast={fireToast} />
        )}
      </main>

      {/* 4. Bottom Analytics Overview Section */}
      <AnalyticsSection analytics={analytics} />

      {/* 5. Shared Modals & Floating Helpers */}
      <Toast message={toastMessage} />
      <FloatingChatbot />
    </div>
  );
}