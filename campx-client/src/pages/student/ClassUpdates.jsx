import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { announcementService } from '../../services/announcementService';
import { resourceService } from '../../services/resourceService';
import api from '../../api/axios';
import { 
  Megaphone, FileText, Users, UserCheck, 
  Clock, ArrowRight, AlertTriangle, MapPin, Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ClassUpdates = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [resources, setResources] = useState([]);
  const [faculty, setFaculty] = useState({ classTeacher: null, proctor: null });
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
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  const hasFaculty = faculty.classTeacher || faculty.proctor;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className=" mx-auto px-5 py-6">
          <h1 className="text-xl font-semibold text-gray-900">Class Updates</h1>
          <p className="text-sm text-gray-500 mt-1">
            From your class teacher and proctor
          </p>
        </div>
      </div>

      <div className=" mx-auto px-5 py-6">
        {/* Faculty Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Class Teacher */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <UserCheck size={18} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Class Teacher</p>
                <p className="font-medium text-gray-900">
                  {faculty?.classTeacher?.name || 'Not assigned'}
                </p>
                {faculty?.classTeacher?.department && (
                  <p className="text-xs text-gray-400 mt-1">{faculty.classTeacher.department}</p>
                )}
              </div>
            </div>
          </div>

          {/* Proctor */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Users size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Proctor</p>
                <p className="font-medium text-gray-900">
                  {faculty?.proctor?.name || 'Not assigned'}
                </p>
                {faculty?.proctor?.department && (
                  <p className="text-xs text-gray-400 mt-1">{faculty.proctor.department}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* No Faculty Warning */}
        {!hasFaculty && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-yellow-700 text-sm flex items-center gap-2">
              <AlertTriangle size={14} />
              No faculty assigned yet
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 mb-5">
          <button
            onClick={() => setActiveTab('announcements')}
            className={`pb-2 text-sm font-medium transition-colors ${
              activeTab === 'announcements'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Announcements
            {announcements.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                {announcements.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`pb-2 text-sm font-medium transition-colors ${
              activeTab === 'resources'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Resources
            {resources.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                {resources.length}
              </span>
            )}
          </button>
        </div>

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <>
            {announcements.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg py-12 text-center">
                <Megaphone size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No announcements yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((item) => (
                  <Link
                    key={item._id}
                    to={`/announcement/${item._id}`}
                    className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex gap-3">
                      <div className="w-1 bg-blue-500 rounded-full flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${getPriorityColor(item.priority)}`}>
                            {item.priority || 'Normal'}
                          </span>
                          <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
                          {item.createdBy && (
                            <span className="text-xs text-gray-400">
                              {item.createdBy.name?.split(' ')[0]}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                        
                        {(item.location || (item.type && item.type !== 'general')) && (
                          <div className="flex gap-3 mt-2 text-xs text-gray-400">
                            {item.location && (
                              <span className="flex items-center gap-1">
                                <MapPin size={12} /> {item.location}
                              </span>
                            )}
                            {item.type && item.type !== 'general' && (
                              <span className="capitalize">{item.type}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <>
            {resources.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg py-12 text-center">
                <FileText size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No resources yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {resources.map((item) => (
                  <Link
                    key={item._id}
                    to={`/resource/${item._id}`}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText size={16} className="text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">{item.category}</span>
                          <span className="text-xs text-gray-400">{item.downloads || 0} downloads</span>
                        </div>
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-1">{item.title}</h3>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">{item.description}</p>
                        <p className="text-xs text-gray-400 mt-2">{formatDate(item.createdAt)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* View All Links */}
        {activeTab === 'announcements' && announcements.length > 3 && (
          <div className="mt-5 text-center">
            <Link to="/student/announcements" className="text-sm text-blue-600 hover:text-blue-700">
              View all announcements →
            </Link>
          </div>
        )}

        {activeTab === 'resources' && resources.length > 4 && (
          <div className="mt-5 text-center">
            <Link to="/student/resources" className="text-sm text-blue-600 hover:text-blue-700">
              View all resources →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassUpdates;