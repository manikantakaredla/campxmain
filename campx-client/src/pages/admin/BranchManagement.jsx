import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { settingService } from '../../services/settingService';
import toast from 'react-hot-toast';

const BranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '' });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await settingService.getBranches();
      setBranches(response.branches);
    } catch (error) {
      toast.error('Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.code) {
      toast.error('Please enter name and code');
      return;
    }
    try {
      await settingService.createBranch(formData);
      toast.success('Branch created successfully');
      setShowAddModal(false);
      setFormData({ name: '', code: '' });
      fetchBranches();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create branch');
    }
  };

  const handleUpdate = async () => {
    if (!editingBranch) return;
    try {
      await settingService.updateBranch(editingBranch._id, formData);
      toast.success('Branch updated successfully');
      setEditingBranch(null);
      setFormData({ name: '', code: '' });
      fetchBranches();
    } catch (error) {
      toast.error('Failed to update branch');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will delete all sections under this branch.')) return;
    try {
      await settingService.deleteBranch(id);
      toast.success('Branch deleted');
      fetchBranches();
    } catch (error) {
      toast.error('Failed to delete branch');
    }
  };

  if (loading) return <div className="flex justify-center py-12">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Branch Management</h1>
          <p className="text-gray-500 mt-1">Manage departments and their sections</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Branch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {branches.map(branch => (
          <div key={branch._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-800">{branch.name}</h3>
                <p className="text-xs text-gray-500">Code: {branch.code}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setEditingBranch(branch);
                    setFormData({ name: branch.name, code: branch.code });
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(branch._id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Sections</h4>
              <div className="flex flex-wrap gap-2">
                {branch.sections?.map(section => (
                  <span key={section._id} className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600">
                    Section {section.name}
                  </span>
                ))}
                {(!branch.sections || branch.sections.length === 0) && (
                  <p className="text-xs text-gray-400">No sections added</p>
                )}
              </div>
              <button
                onClick={() => {/* Navigate to section management */}}
                className="mt-3 text-xs text-blue-600 hover:text-blue-700"
              >
                + Manage Sections
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingBranch) && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => { setShowAddModal(false); setEditingBranch(null); }} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">{editingBranch ? 'Edit Branch' : 'Add Branch'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., CSE"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => { setShowAddModal(false); setEditingBranch(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={editingBranch ? handleUpdate : handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingBranch ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BranchManagement;