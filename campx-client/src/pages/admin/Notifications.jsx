import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { 
  Bell, 
  Check, 
  Trash2, 
  CheckCheck, 
  Plus, 
  X,
  Mail,
  Calendar,
  BookOpen,
  Clock,
  AlertCircle
} from "lucide-react";
import {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../../services/notificationService";
import { useAuth } from "../../context/AuthContext";

function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "system",
    targetBranch: "ALL",
    targetYear: "ALL",
    recipient: null,
  });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      setNotifications(res.data.notifications || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!formData.message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      await createNotification(formData);
      toast.success("Notification created successfully");
      setFormData({
        title: "",
        message: "",
        type: "system",
        targetBranch: "ALL",
        targetYear: "ALL",
        recipient: null,
      });
      setShowForm(false);
      fetchNotifications();
    } catch (error) {
      toast.error(error.response?.data?.message || "Creation failed");
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      toast.success("Marked as read");
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) return;
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "announcement":
        return <Megaphone size={16} />;
      case "event":
        return <Calendar size={16} />;
      case "resource":
        return <BookOpen size={16} />;
      case "schedule":
        return <Clock size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "announcement":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "event":
        return "bg-green-50 text-green-700 border-green-100";
      case "resource":
        return "bg-purple-50 text-purple-700 border-purple-100";
      case "schedule":
        return "bg-yellow-50 text-yellow-700 border-yellow-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-500 mt-3">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {unreadCount > 0 ? (
              <span className="text-blue-600">You have {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}</span>
            ) : (
              "You're all caught up!"
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {notifications.length > 0 && unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <CheckCheck size={16} />
              Mark All Read
            </button>
          )}
          {(user?.role === "admin" || user?.role === "faculty") && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              <Plus size={16} />
              Create
            </button>
          )}
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-800">Create New Notification</h2>
            <button 
              onClick={() => setShowForm(false)} 
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleCreate} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
              <input
                type="text"
                placeholder="Enter notification title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Message</label>
              <textarea
                placeholder="Enter notification message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm resize-none"
                rows="3"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white"
                >
                  <option value="system">System</option>
                  <option value="announcement">Announcement</option>
                  <option value="event">Event</option>
                  <option value="resource">Resource</option>
                  <option value="schedule">Schedule</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Target Branch</label>
                <input
                  type="text"
                  placeholder="ALL for all branches"
                  value={formData.targetBranch}
                  onChange={(e) => setFormData({ ...formData, targetBranch: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Target Year</label>
                <input
                  type="text"
                  placeholder="ALL for all years"
                  value={formData.targetYear}
                  onChange={(e) => setFormData({ ...formData, targetYear: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
              >
                Publish Notification
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell size={28} className="text-gray-300" />
          </div>
          <h2 className="text-base font-medium text-gray-500">No notifications</h2>
          <p className="text-sm text-gray-400 mt-1">When you receive notifications, they'll appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-white border rounded-xl p-4 transition-all hover:shadow-sm ${
                !notification.isRead ? "border-l-4 border-l-blue-500 border-l-4 border-gray-200" : "border-gray-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                  {getTypeIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-900">
                      {notification.title}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(notification.type)}`}>
                      {notification.type}
                    </span>
                    {!notification.isRead && (
                      <span className="text-xs text-blue-600 font-medium">● New</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <span>{new Date(notification.createdAt).toLocaleString()}</span>
                    {notification.targetBranch && notification.targetBranch !== "ALL" && (
                      <span className="px-1.5 py-0.5 bg-gray-100 rounded">Branch: {notification.targetBranch}</span>
                    )}
                    {notification.targetYear && notification.targetYear !== "ALL" && (
                      <span className="px-1.5 py-0.5 bg-gray-100 rounded">Year: {notification.targetYear}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 ml-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  {(user?.role === "admin" || user?.role === "faculty") && (
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;