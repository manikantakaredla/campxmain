import React, { useState, useEffect } from 'react';
import { createOpportunity, updateOpportunity } from '../../../services/opportunityService';
import toast from 'react-hot-toast';
import { X, Save } from 'lucide-react';

const OpportunityForm = ({ isOpen, onClose, opportunity, onRefresh }) => {
  const [formData, setFormData] = useState({
    title: '', description: '', type: 'Placement Drive', companyName: '',
    package: '', location: '', registrationDeadline: '', eventDate: '',
    priority: 'Medium', applicationLink: '',
    eligibility: { branches: [], years: [], cgpa: '', backlogAllowed: false }
  });

  useEffect(() => {
    if (opportunity) {
      setFormData({
        ...opportunity,
        registrationDeadline: opportunity.registrationDeadline ? new Date(opportunity.registrationDeadline).toISOString().split('T')[0] : '',
        eventDate: opportunity.eventDate ? new Date(opportunity.eventDate).toISOString().split('T')[0] : '',
        eligibility: opportunity.eligibility || { branches: [], years: [], cgpa: '', backlogAllowed: false }
      });
    } else {
      setFormData({
        title: '', description: '', type: 'Placement Drive', companyName: '',
        package: '', location: '', registrationDeadline: '', eventDate: '',
        priority: 'Medium', applicationLink: '',
        eligibility: { branches: [], years: [], cgpa: '', backlogAllowed: false }
      });
    }
  }, [opportunity, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (opportunity) {
        await updateOpportunity(opportunity._id, formData);
        toast.success('Updated successfully');
      } else {
        await createOpportunity(formData);
        toast.success('Created successfully');
      }
      onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleBranchToggle = (branch) => {
    const branches = formData.eligibility.branches;
    if (branches.includes(branch)) {
      setFormData({ ...formData, eligibility: { ...formData.eligibility, branches: branches.filter(b => b !== branch) }});
    } else {
      setFormData({ ...formData, eligibility: { ...formData.eligibility, branches: [...branches, branch] }});
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">{opportunity ? 'Edit Opportunity' : 'Create New Opportunity'}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="op-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input required type="text" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role/Title *</label>
                <input required type="text" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="Placement Drive">Placement Drive</option>
                  <option value="Internship">Internship</option>
                  <option value="Hackathon">Hackathon</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package/Stipend</label>
                <input type="text" placeholder="e.g. 12 LPA" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500" value={formData.package} onChange={e => setFormData({...formData, package: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Deadline</label>
                <input type="date" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500" value={formData.registrationDeadline} onChange={e => setFormData({...formData, registrationDeadline: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                <input type="date" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500" value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows="4" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Eligibility Criteria</h3>
              
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-2">Allowed Branches</label>
                <div className="flex flex-wrap gap-2">
                  {['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIML', 'DS'].map(branch => (
                    <label key={branch} className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded border border-gray-300 cursor-pointer hover:bg-blue-50">
                      <input 
                        type="checkbox" 
                        checked={formData.eligibility?.branches?.includes(branch) || false} 
                        onChange={() => handleBranchToggle(branch)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{branch}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Minimum CGPA</label>
                  <input type="number" step="0.1" className="w-full border-gray-300 rounded-lg shadow-sm text-sm" value={formData.eligibility?.cgpa || ''} onChange={e => setFormData({...formData, eligibility: {...formData.eligibility, cgpa: e.target.value}})} />
                </div>
                <div className="flex items-center mt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" checked={formData.eligibility?.backlogAllowed || false} onChange={e => setFormData({...formData, eligibility: {...formData.eligibility, backlogAllowed: e.target.checked}})} />
                    <span className="text-sm font-medium text-gray-700">Allow Active Backlogs</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">External Application Link</label>
              <input type="url" placeholder="https://..." className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500" value={formData.applicationLink} onChange={e => setFormData({...formData, applicationLink: e.target.value})} />
            </div>

          </form>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button form="op-form" type="submit" className="px-6 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm">
            <Save size={18} /> {opportunity ? 'Save Changes' : 'Create Opportunity'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpportunityForm;
