import React, { useState, useEffect } from 'react';
import { getOpportunities, deleteOpportunity, restoreOpportunity } from '../../../services/opportunityService';
import OpportunityForm from './OpportunityForm';
import ApplicationsManager from './ApplicationsManager';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, RotateCcw, Users, Eye, Bookmark, FileCheck } from 'lucide-react';

const AdminOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAppManagerOpen, setIsAppManagerOpen] = useState(false);
  const [editingOp, setEditingOp] = useState(null);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const res = await getOpportunities({ limit: 100 });
      setOpportunities(res.data);
    } catch (err) {
      toast.error('Failed to fetch opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(opportunities.map(o => o._id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to soft delete this?')) return;
    try {
      await deleteOpportunity(id);
      toast.success('Opportunity deleted');
      fetchOpportunities();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreOpportunity(id);
      toast.success('Opportunity restored');
      fetchOpportunities();
    } catch (err) {
      toast.error('Failed to restore');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} items?`)) return;
    try {
      await Promise.all(selectedIds.map(id => deleteOpportunity(id)));
      toast.success(`Deleted ${selectedIds.length} items`);
      setSelectedIds([]);
      fetchOpportunities();
    } catch (err) {
      toast.error('Bulk delete failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Opportunities</h1>
          <p className="text-gray-600">Create and track drives, internships, and placements.</p>
        </div>
        <button 
          onClick={() => { setEditingOp(null); setIsFormOpen(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={18} /> Add Opportunity
        </button>
      </div>

      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4 flex justify-between items-center animate-in fade-in duration-200">
          <span className="font-medium text-blue-800">{selectedIds.length} items selected</span>
          <div className="flex gap-2">
            <button 
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200"
            >
              Bulk Delete
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === opportunities.length && opportunities.length > 0} className="rounded text-blue-600" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Opportunity</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Analytics</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : opportunities.length === 0 ? (
              <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">No opportunities found.</td></tr>
            ) : (
              opportunities.map(op => {
                const analytics = op.analytics || { views: 0, saves: 0, applied: 0, selected: 0 };
                const selectionPercent = analytics.applied > 0 ? ((analytics.selected / analytics.applied) * 100).toFixed(1) : 0;
                
                return (
                  <tr key={op._id} className={op.isDeleted ? 'bg-red-50/30 opacity-75' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input type="checkbox" checked={selectedIds.includes(op._id)} onChange={() => handleSelectOne(op._id)} className="rounded text-blue-600" />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{op.companyName}</div>
                      <div className="text-sm text-gray-500">{op.title}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${op.status === 'Closed' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                        {op.status}
                      </span>
                      {op.isDeleted && <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Deleted</span>}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1"><Eye size={12}/> {analytics.views}</div>
                        <div className="flex items-center gap-1"><Bookmark size={12}/> {analytics.saves}</div>
                        <div className="flex items-center gap-1"><FileText size={12}/> {analytics.applied}</div>
                        <div className="flex items-center gap-1 text-green-600 font-medium"><CheckCircle2 size={12}/> {analytics.selected} ({selectionPercent}%)</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setEditingOp(op); setIsAppManagerOpen(true); }}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
                          title="Manage Applications"
                        >
                          <Users size={18} />
                        </button>
                        <button 
                          onClick={() => { setEditingOp(op); setIsFormOpen(true); }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 size={18} />
                        </button>
                        {op.isDeleted ? (
                          <button onClick={() => handleRestore(op._id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                            <RotateCcw size={18} />
                          </button>
                        ) : (
                          <button onClick={() => handleDelete(op._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <OpportunityForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        opportunity={editingOp}
        onRefresh={fetchOpportunities}
      />

      <ApplicationsManager
        isOpen={isAppManagerOpen}
        onClose={() => setIsAppManagerOpen(false)}
        opportunity={editingOp}
      />
    </div>
  );
};

// Imports for missing icons up top
import { CheckCircle2, FileText } from 'lucide-react';
export default AdminOpportunities;
