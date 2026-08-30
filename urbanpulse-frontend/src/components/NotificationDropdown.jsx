import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Check,
  CheckCheck,
  Loader2,
  AlertCircle,
  Clock,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";
import { notificationService } from "../api/notification.service";

function formatNotificationTime(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function getNotificationIcon(type) {
  const key = String(type || "").toLowerCase();
  if (key.includes("alert") || key.includes("warning")) {
    return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  }
  if (key.includes("resolved") || key.includes("success")) {
    return <Check className="h-4 w-4 text-emerald-500" />;
  }
  return <Info className="h-4 w-4 text-emerald-600" />;
}

export default function NotificationDropdown({ onUnreadCountChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getNotifications();
      const items = Array.isArray(data) ? data : [];
      setNotifications(items);
      if (onUnreadCountChange) {
        onUnreadCountChange(items.filter((n) => !n.is_read).length);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("Unable to load notifications");
    } finally {
      setLoading(false);
    }
  }, [onUnreadCountChange]);

  // Initial fetch for count
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen((prev) => !prev);
  };

  const handleMarkAsRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      if (onUnreadCountChange) {
        onUnreadCountChange(Math.max(0, unreadCount - 1));
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      if (onUnreadCountChange) {
        onUnreadCountChange(0);
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        className="relative rounded-full p-2 text-emerald-100/90 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#0B2818]" />
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-80 sm:w-96 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 transition"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all as read
                </button>
              )}
            </div>

            {/* Content List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                  <span className="text-xs">Loading notifications...</span>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-slate-500">
                  <AlertCircle className="h-5 w-5 text-rose-500" />
                  <p className="text-xs">{error}</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-1.5 py-10 text-center text-slate-400">
                  <Bell className="h-7 w-7 text-slate-300" />
                  <p className="text-xs font-medium text-slate-600">
                    No notifications yet
                  </p>
                  <p className="text-[11px] text-slate-400">
                    We'll notify you when there's an update on your reports.
                  </p>
                </div>
              ) : (
                notifications.map((item) => {
                  const isUnread = !item.is_read;
                  return (
                    <div
                      key={item.id}
                      onClick={() => isUnread && handleMarkAsRead(item.id)}
                      className={`group relative flex items-start gap-3 p-3.5 transition hover:bg-slate-50/80 cursor-pointer ${
                        isUnread ? "bg-emerald-50/30" : "bg-white"
                      }`}
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        {getNotificationIcon(item.notification_type || item.type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="truncate text-xs font-semibold text-slate-800">
                            {item.title || "Notification"}
                          </p>
                          <span className="shrink-0 text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatNotificationTime(item.created_at)}
                          </span>
                        </div>

                        <p className="mt-0.5 text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {item.message || item.body || "No additional message."}
                        </p>
                      </div>

                      {isUnread && (
                        <span
                          title="Mark as read"
                          onClick={(e) => handleMarkAsRead(item.id, e)}
                          className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500 ring-4 ring-emerald-100"
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}