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
  const [facultyStats, setFacultyStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchFacultyAnalytics();
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
    }
  };

  const fetchFacultyAnalytics = async () => {
    try {
      const response = await api.get('/admin/faculty/analytics');
      if (response.data.success) {
        setFacultyStats(response.data.analytics);
      }
    } catch (error) {
      console.error('Error fetching faculty analytics:', error);
    }
  };

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: GraduationCap, change: '+12%', color: 'blue', link: '/admin/users' },
    { label: 'Total Faculty', value: stats.totalFaculty, icon: Briefcase, change: '+5%', color: 'purple', link: '/admin/users' },
    { label: 'Announcements', value: stats.totalAnnouncements, icon: Megaphone, change: '+8%', color: 'orange', link: '/admin/announcements' },
    { label: 'Resources', value: stats.totalResources, icon: FileText, change: '+15%', color: 'green', link: '/admin/resources' },
    { label: 'Active Users', value: stats.activeUsers, icon: Users, change: '+3%', color: 'teal', link: '/admin/users' },
  ];

  const quickActions = [
    { icon: Upload, label: 'Upload Students', desc: 'Import student data', color: 'blue', link: '/admin/upload-data' },
    { icon: Upload, label: 'Upload Faculty', desc: 'Import faculty data', color: 'green', link: '/admin/upload-data' },
    { icon: Briefcase, label: 'Faculty Workload', desc: 'Manage subjects and classes', color: 'purple', link: '/admin/faculty-management' },
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#f8f9fa] min-h-screen font-sans">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
            <span className="bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5 font-medium">
            <Activity size={16} className="text-indigo-400" />
            Here's what's happening across the platform today.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100/80">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm shadow-inner">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-800 leading-none">{user?.name || 'Admin'}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Administrator</p>
          </div>
          <ChevronDown size={16} className="text-gray-400 ml-1" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((item, idx) => {
          const colors = getColorClasses(item.color);
          return (
            <Link
              key={idx}
              to={item.link}
              className="bg-white rounded-2xl p-5 border border-gray-100/50 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-16 h-16 ${colors.bg} rounded-bl-full opacity-50 -z-10 group-hover:scale-110 transition-transform duration-500`}></div>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center shadow-sm`}>
                  <item.icon size={18} className={colors.text} />
                </div>
                {item.change && (
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${item.change === 'pending'
                      ? 'bg-amber-100/80 text-amber-700'
                      : 'bg-emerald-100/80 text-emerald-700'
                    }`}>
                    {item.change}
                  </span>
                )}
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900 tracking-tight">{item.value.toLocaleString()}</p>
                <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">{item.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Users */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 rounded-lg">
                  <Users size={18} className="text-indigo-600" />
                </div>
                Recent Registrations
              </h2>
              <p className="text-sm text-gray-500 mt-1">Latest users added to the platform</p>
            </div>
            <Link to="/admin/users" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100">
              View all <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="flex-1 p-0">
            {recentUsers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-12">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Users size={28} className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No recent users</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentUsers.slice(0, 6).map((u) => (
                  <div key={u._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/80 transition-colors group">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-white">
                          <span className="text-sm font-bold text-indigo-700">{u.name?.charAt(0) || 'U'}</span>
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{u.name}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          u.role === 'faculty' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                        }`}>
                        {u.role}
                      </span>
                      <Link to={`/admin/users/${u._id}`} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100">
                        <Eye size={16} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-white/50 backdrop-blur-sm">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <div className="p-1.5 bg-amber-50 rounded-lg">
                  <Sparkles size={16} className="text-amber-500" />
                </div>
                Quick Actions
              </h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2">
              {quickActions.map((action, idx) => {
                const colors = getColorClasses(action.color);
                return (
                  <Link
                    key={idx}
                    to={action.link}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group"
                  >
                    <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                      <action.icon size={18} className={colors.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">{action.label}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{action.desc}</p>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-white border border-gray-100 flex items-center justify-center group-hover:border-gray-300 transition-colors">
                      <ArrowUpRight size={12} className="text-gray-400 group-hover:text-gray-600" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Department Engagements */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-white/50 backdrop-blur-sm">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 rounded-lg">
                  <Activity size={16} className="text-indigo-600" />
                </div>
                Department Distribution
              </h3>
            </div>
            <div className="p-6 space-y-5">
              {departmentData.map((item, idx) => {
                const colors = getColorClasses(item.color);
                const percentage = Math.min((item.count / 500) * 100, 100);
                return (
                  <div key={idx} className="group">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700 font-semibold">{item.dept}</span>
                      <span className="font-bold text-gray-900">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`${colors.bar} h-full rounded-full transition-all duration-1000 ease-out group-hover:opacity-80`}
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