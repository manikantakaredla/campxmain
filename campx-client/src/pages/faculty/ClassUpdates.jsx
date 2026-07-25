import React, { useState } from 'react';
import { BookOpen, Users, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';

const FacultyClassUpdates = () => {
  const [activeTab, setActiveTab] = useState('permissions');

  // Static demo data for permissions
  const permissionsData = [
    { id: 1, studentName: 'Rahul Kumar', rollNo: '22A91A0501', permissionType: 'Workshop', reason: 'Attending AI Workshop at IIT Madras', status: 'Pending', date: '2026-07-26' },
    { id: 2, studentName: 'Priya Sharma', rollNo: '22A91A0502', permissionType: 'Hackathon', reason: 'Participating in Smart India Hackathon', status: 'Approved', date: '2026-07-27' },
    { id: 3, studentName: 'Amit Singh', rollNo: '22A91A0503', permissionType: 'Sports', reason: 'University Cricket Tournament', status: 'Pending', date: '2026-07-28' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Class Updates</h1>
        <p className="text-gray-500 mt-1">Manage class announcements and student permissions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('updates')}
          className={`px-4 py-3 font-medium text-sm transition-all border-b-2 ${
            activeTab === 'updates'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          Updates
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-4 py-3 font-medium text-sm transition-all border-b-2 ${
            activeTab === 'permissions'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          Permissions
        </button>
      </div>

      {/* Content */}
      {activeTab === 'permissions' && (
        <div className="space-y-6 animate-fade-in">
          {/* Current Class Info Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 flex flex-col md:flex-row md:items-center justify-between shadow-sm gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">Ongoing Class</h2>
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-gray-600 text-sm md:text-base">
                <div className="flex items-center gap-2 font-medium text-blue-700">
                  <BookOpen size={18} />
                  B.Tech CSE - 3rd Year (Section A)
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={18} />
                  Room 304, Main Block
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  10:30 AM - 11:20 AM
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-sm text-blue-600 flex-shrink-0">
              <Users size={28} />
            </div>
          </div>

          {/* Permissions Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-800">Student Permissions Request</h3>
              <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-semibold">
                3 Pending
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Roll No</th>
                    <th className="px-6 py-4">Permission Type</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {permissionsData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-800">{item.studentName}</td>
                      <td className="px-6 py-4">{item.rollNo}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                          {item.permissionType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={item.reason}>{item.reason}</td>
                      <td className="px-6 py-4">{item.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {item.status === 'Pending' && (
                          <>
                            <button className="text-green-600 hover:bg-green-50 p-1.5 rounded-lg transition-colors" title="Approve">
                              <CheckCircle size={18} />
                            </button>
                            <button className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors" title="Reject">
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        {item.status === 'Approved' && (
                           <span className="text-sm text-gray-400 font-medium">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'updates' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500 animate-fade-in">
          <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-1">No Class Updates</h3>
          <p>You haven't posted any updates for your current classes.</p>
        </div>
      )}
    </div>
  );
};

export default FacultyClassUpdates;
