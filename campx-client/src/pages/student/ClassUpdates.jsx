import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { announcementService } from '../../services/announcementService';
import { resourceService } from '../../services/resourceService';
import api from '../../api/axios';
import { 
  Megaphone, FileText, Users, UserCheck, 
  Clock, ArrowRight, AlertTriangle, MapPin, Calendar, BookOpen, MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ClassUpdates = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [resources, setResources] = useState([]);
  const [faculty, setFaculty] = useState({ classTeacher: null, proctor: null, teachingFaculty: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('announcements');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [annRes, resRes, facultyRes] = await Promise.all([
          announcementService.getAll({ forClass: true, limit: 10 }),
          resourceService.getAll({ forClass: true, limit: 10 }),
          api.get('/student/assigned-faculty')
        ]);
        setAnnouncements(annRes.announcements || []);
        setResources(resRes.resources || []);
        if (facultyRes?.data?.success) {
          setFaculty(facultyRes.data.data);
        }
      } catch (err) {
        console.error('Error:', err);
        toast.error('Failed to load updates');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20 bg-[#f8f9fa] min-h-screen">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  const hasFaculty = faculty.classTeacher || faculty.proctor;

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-900">Class Updates</h1>
          <p className="text-xs text-gray-500 font-medium mt-1">From your class teacher and proctor</p>
        </div>

        {/* Faculty Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Class Teacher */}
          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-indigo-100">
              <UserCheck size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-0.5">Class Teacher</p>
              <p className="font-bold text-gray-900 text-sm">
                {faculty?.classTeacher?.name || 'Not assigned'}
              </p>
              {faculty?.classTeacher?.department && (
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">{faculty.classTeacher.department}</p>
              )}
            </div>
          </div>

          {/* Proctor */}
          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-purple-100">
              <Users size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-0.5">Proctor</p>
              <p className="font-bold text-gray-900 text-sm">
                {faculty?.proctor?.name || 'Not assigned'}
              </p>
              {faculty?.proctor?.department && (
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">{faculty.proctor.department}</p>
              )}
            </div>
          </div>
        </div>

        {/* Teaching Faculty List */}
        {faculty?.teachingFaculty?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
              <BookOpen size={16} className="text-blue-500" />
              Teaching Faculty
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {faculty.teachingFaculty.map(tf => (
                <div key={tf._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen size={16} className="text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest truncate mb-0.5">
                      {tf.subjectId?.name}
                    </p>
                    <p className="font-bold text-gray-900 text-xs truncate">
                      {tf.facultyId?.name}
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium truncate">
                      {tf.subjectId?.code}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Faculty Warning */}
        {!hasFaculty && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 shadow-sm">
            <p className="text-yellow-700 text-xs font-bold flex items-center gap-2">
              <AlertTriangle size={16} />
              No faculty assigned yet
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 mb-5">
          <button
            onClick={() => setActiveTab('announcements')}
            className={`pb-2 text-xs md:text-sm font-bold transition-colors ${
              activeTab === 'announcements'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Announcements
            {announcements.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-md border border-gray-200">
                {announcements.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`pb-2 text-xs md:text-sm font-bold transition-colors ${
              activeTab === 'resources'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Resources
            {resources.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-md border border-gray-200">
                {resources.length}
              </span>
            )}
          </button>
        </div>

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {announcements.length === 0 ? (
              <div className="col-span-full bg-white border border-gray-100 rounded-3xl py-12 text-center shadow-sm">
                <Megaphone size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-xs font-bold">No announcements yet</p>
              </div>
            ) : (
              announcements.map((item) => (
                <Link
                  key={item._id}
                  to={`/announcement/${item._id}`}
                  className="bg-white rounded-2xl p-4 md:p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-md transition-all flex flex-col gap-3 group"
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${getPriorityColor(item.priority)}`}>
                      {item.priority || 'Normal'}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">{formatDate(item.createdAt)}</span>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                  </div>
                  
                  <div className="flex gap-3 mt-auto pt-3 border-t border-gray-50 text-[10px] font-bold text-gray-400">
                    {item.createdBy && (
                      <span className="flex items-center gap-1.5">
                        <UserCheck size={12}/> {item.createdBy.name?.split(' ')[0]}
                      </span>
                    )}
                    {item.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={12} /> {item.location}
                      </span>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.length === 0 ? (
              <div className="col-span-full bg-white border border-gray-100 rounded-3xl py-12 text-center shadow-sm">
                <FileText size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-xs font-bold">No resources yet</p>
              </div>
            ) : (
              resources.map((item) => (
                <Link
                  key={item._id}
                  to={`/resource/${item._id}`}
                  className="bg-white rounded-2xl p-4 md:p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-md transition-all flex items-start gap-4 group"
                >
                  <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                    <FileText size={18} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-black bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase tracking-widest">{item.category}</span>
                      <span className="text-[10px] font-bold text-gray-400">{item.downloads || 0} dl</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors mb-0.5">{item.title}</h3>
                    <p className="text-[10px] md:text-xs text-gray-500 line-clamp-1">{item.description}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-2">{formatDate(item.createdAt)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* View All Links */}
        {activeTab === 'announcements' && announcements.length > 9 && (
          <div className="mt-6 text-center">
            <Link to="/student/announcements" className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl transition-colors inline-block">
              View all announcements
            </Link>
          </div>
        )}

        {activeTab === 'resources' && resources.length > 9 && (
          <div className="mt-6 text-center">
            <Link to="/student/resources" className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl transition-colors inline-block">
              View all resources
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassUpdates;