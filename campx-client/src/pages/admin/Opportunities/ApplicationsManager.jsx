import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import { updateApplicationStatus } from '../../../services/opportunityService';
import toast from 'react-hot-toast';
import { X, Search } from 'lucide-react';
import ApplicationStatusBadge from '../../../components/opportunities/ApplicationStatusBadge';

const ApplicationsManager = ({ isOpen, onClose, opportunity }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && opportunity) {
      fetchApplications();
    }
  }, [isOpen, opportunity]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      // Assuming GET /api/opportunities/:id/applications exists
      const { data } = await API.get(`/opportunities/${opportunity._id}/applications`);
      setApplications(data.data || []);
    } catch (err) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      fetchApplications();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  if (!isOpen || !opportunity) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        <div className="px-6 py-4 border-b border-gray-100 bg-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Manage Applications</h2>
            <p className="text-sm text-gray-500">{opportunity.companyName} - {opportunity.title}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading applications...</div>
            ) : applications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No applications received yet.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map(app => (
                    <tr key={app._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{app.studentId?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{app.studentId?.rollNumber}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <ApplicationStatusBadge status={app.status} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <select 
                          className="text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                          value={app.status}
                          onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                        >
                          <option value="Applied">Applied</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Selected">Selected</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ApplicationsManager;
