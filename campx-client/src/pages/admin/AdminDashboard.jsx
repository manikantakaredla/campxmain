import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import {
  Users, GraduationCap, Briefcase, Megaphone,
  FileText, UserPlus, Upload, Settings,
  Eye, ArrowUpRight, Activity, Sparkles, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalAnnouncements: 0,
    totalResources: 0,
    pendingFaculty: 0,
    activeUsers: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      const data = response.data.stats || {};
      setStats({
        totalStudents: data.totalStudents || 0,
        totalFaculty: data.totalFaculty || 0,
        totalAnnouncements: data.totalAnnouncements || 0,
        totalResources: data.totalResources || 0,
        pendingFaculty: data.pendingFaculty || 0,
        activeUsers: data.activeUsers || 0
      });
      setRecentUsers(response.data.recentActivities?.users || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: GraduationCap, change: '+12%', color: 'blue', link: '/admin/users' },
    { label: 'Total Faculty', value: stats.totalFaculty, icon: Briefcase, change: '+5%', color: 'purple', link: '/admin/users' },
    { label: 'Announcements', value: stats.totalAnnouncements, icon: Megaphone, change: '+8%', color: 'orange', link: '/admin/announcements' },
    { label: 'Resources', value: stats.totalResources, icon: FileText, change: '+15%', color: 'green', link: '/admin/resources' },
    { label: 'Active Users', value: stats.activeUsers, icon: Users, change: '+3%', color: 'teal', link: '/admin/users' },
    { label: 'Pending Faculty', value: stats.pendingFaculty, icon: UserPlus, change: 'pending', color: 'gray', link: '/admin/users' },
  ];

  const quickActions = [
    { icon: Upload, label: 'Upload Students', desc: 'Import student data', color: 'blue', link: '/admin/upload-data' },
    { icon: Upload, label: 'Upload Faculty', desc: 'Import faculty data', color: 'green', link: '/admin/upload-data' },
    { icon: Megaphone, label: 'Announcements', desc: 'Create new announcement', color: 'purple', link: '/admin/announcements' },
    { icon: Settings, label: 'Settings', desc: 'Configure platform', color: 'gray', link: '/admin/settings' },
  ];

  const departmentData = [
    { dept: 'CSE', count: 450, color: 'blue' },
    { dept: 'ECE', count: 320, color: 'purple' },
    { dept: 'IT', count: 280, color: 'green' },
    { dept: 'MECH', count: 150, color: 'orange' },
    { dept: 'CIVIL', count: 120, color: 'teal' }
  ];

  const getColorClasses = (color) => {
    const map = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', bar: 'bg-blue-500' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', bar: 'bg-purple-500' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-600', bar: 'bg-orange-500' },
      green: { bg: 'bg-green-50', text: 'text-green-600', bar: 'bg-green-500' },
      teal: { bg: 'bg-teal-50', text: 'text-teal-600', bar: 'bg-teal-500' },
      gray: { bg: 'bg-gray-50', text: 'text-gray-600', bar: 'bg-gray-500' },
    };
    return map[color] || map.blue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50/80 min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 tracking-tight flex items-center gap-2">
            <span className="text-indigo-500">Dashboard</span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
            <Activity size={14} className="text-gray-300" />
            Here's what's happening with your platform today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
          <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-medium text-xs">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <span className="font-medium text-gray-700 hidden sm:inline">{user?.name || 'Admin'}</span>
          <ChevronDown size={14} className="text-gray-400" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statCards.map((item, idx) => {
          const colors = getColorClasses(item.color);
          return (
            <Link
              key={idx}
              to={item.link}
              className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100/80 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 ${colors.bg} rounded-lg flex items-center justify-center`}>
                  <item.icon size={16} className={colors.text} />
                </div>
                {item.change && (
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                    item.change === 'pending' 
                      ? 'bg-amber-50 text-amber-600' 
                      : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {item.change}
                  </span>
                )}
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{item.value.toLocaleString()}</p>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">{item.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Recent Users */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100/80 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Users size={16} className="text-indigo-400" />
                Recent users
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest registered users</p>
            </div>
            <Link to="/admin/users" className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>

          {recentUsers.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <Users size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No users yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentUsers.slice(0, 5).map((u) => (
                <div key={u._id} className="px-4 sm:px-5 py-3 flex items-center justify-between hover:bg-gray-50/60 transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-indigo-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-indigo-700">{u.name?.charAt(0) || 'U'}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                      u.role === 'admin' ? 'bg-purple-50 text-purple-700' :
                      u.role === 'faculty' ? 'bg-blue-50 text-blue-700' :
                      'bg-green-50 text-green-700'
                    }`}>
                      {u.role}
                    </span>
                    <Link to={`/admin/users/${u._id}`} className="text-gray-300 hover:text-indigo-600 transition">
                      <Eye size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100/80 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                Quick actions
              </h3>
            </div>
            <div className="p-3 space-y-0.5">
              {quickActions.map((action, idx) => {
                const colors = getColorClasses(action.color);
                return (
                  <Link
                    key={idx}
                    to={action.link}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <action.icon size={14} className={colors.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700">{action.label}</p>
                      <p className="text-xs text-gray-400">{action.desc}</p>
                    </div>
                    <ArrowUpRight size={14} className="text-gray-300 group-hover:text-gray-500 transition" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Department Engagements */}
          <div className="bg-white rounded-xl border border-gray-100/80 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Activity size={16} className="text-indigo-400" />
                Student Engagements
              </h3>
            </div>
            <div className="p-4 space-y-4">
              {departmentData.map((item, idx) => {
                const colors = getColorClasses(item.color);
                const percentage = Math.min((item.count / 500) * 100, 100);
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">{item.dept}</span>
                      <span className="font-semibold text-gray-900">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`${colors.bar} h-1.5 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;