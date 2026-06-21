import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Plus, Search, Filter, Edit, Trash2, Upload, Download, 
  CheckCircle, XCircle, FileText, BarChart2, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import subjectService from '../../services/subjectService';
import { Loader } from '../common/Loader';
import { EmptyState } from '../common/EmptyState';

const SubjectManagement = ({ settings }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '', code: '', department: '', semester: '', credits: '', regulation: ''
  });
  
  // File Upload State
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadDepartment, setUploadDepartment] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, [search, department]);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await subjectService.getSubjects({ search, department });
      setSubjects(res.subjects || []);
    } catch (error) {
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.department) {
      toast.error('Name, Code, and Department are required');
      return;
    }
    try {
      if (editingSubject) {
        await subjectService.updateSubject(editingSubject._id, formData);
        toast.success('Subject updated successfully');
      } else {
        await subjectService.createSubject(formData);
        toast.success('Subject added successfully');
      }
      setShowAddModal(false);
      fetchSubjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save subject');
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      await subjectService.deleteSubject(id);
      toast.success('Subject deleted successfully');
      fetchSubjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete subject');
    }
  };

  const openEditModal = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      department: subject.department,
      semester: subject.semester || '',
      credits: subject.credits || '',
      regulation: subject.regulation || ''
    });
    setShowAddModal(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!uploadDepartment) {
      toast.error('Please select a department first');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    data.append('department', uploadDepartment);

    try {
      const response = await subjectService.bulkUploadSubjects(data);
      setUploadResult(response);
      if (response.uploaded > 0) toast.success(`Successfully uploaded ${response.uploaded} subjects`);
      if (response.failed > 0) toast.error(`${response.failed} subjects failed to upload`);
      fetchSubjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const csvContent = "Subject Code,Subject Name,Semester,Credits,Regulation\nCS301,Database Management Systems,5,4,R23\nCS302,Operating Systems,5,3,R23";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Subjects_Upload_Template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const validBranches = settings?.branchConfigs?.map(c => c.branch) || [];

  // Stats
  const totalSubjects = subjects.length;
  const deptStats = subjects.reduce((acc, curr) => {
    acc[curr.department] = (acc[curr.department] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-indigo-600">Total Subjects</p>
            <p className="text-2xl font-bold text-indigo-900">{totalSubjects}</p>
          </div>
        </div>
        
        <div className="md:col-span-3 bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-4 overflow-x-auto">
          <BarChart2 className="w-5 h-5 text-gray-400 shrink-0" />
          <div className="flex gap-4 min-w-max">
            {Object.entries(deptStats).map(([dept, count]) => (
              <div key={dept} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <span className="text-sm font-medium text-gray-700">{dept}</span>
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Subjects List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between bg-gray-50/50">
            <div className="flex gap-3 flex-1 min-w-[200px]">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search subjects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                />
              </div>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="pl-4 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-gray-700 min-w-[140px]"
              >
                <option value="all">All Depts</option>
                {validBranches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                setEditingSubject(null);
                setFormData({ name: '', code: '', department: '', semester: '', credits: '', regulation: '' });
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Subject
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Subject Name</th>
                  <th className="px-6 py-3">Dept</th>
                  <th className="px-6 py-3">Sem</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12"><Loader /></td>
                  </tr>
                ) : subjects.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8">
                      <EmptyState icon={BookOpen} title="No subjects found" description="Adjust filters or add a new subject." />
                    </td>
                  </tr>
                ) : (
                  subjects.map((sub) => (
                    <tr key={sub._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3 font-medium text-gray-900">{sub.code}</td>
                      <td className="px-6 py-3">{sub.name}</td>
                      <td className="px-6 py-3">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium">
                          {sub.department}
                        </span>
                      </td>
                      <td className="px-6 py-3">{sub.semester || '-'}</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditModal(sub)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteSubject(sub._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Bulk Upload */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <Upload className="w-5 h-5 text-indigo-600" />
              Bulk Upload Subjects
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Department *</label>
                <select
                  value={uploadDepartment}
                  onChange={(e) => setUploadDepartment(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Department...</option>
                  {validBranches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-indigo-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  {uploading ? 'Uploading...' : 'Select CSV/Excel File'}
                </button>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <button onClick={downloadTemplate} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1.5 transition-colors">
                  <Download className="w-4 h-4" /> Download Template
                </button>
              </div>
            </div>
          </div>

          {/* Upload Report */}
          {uploadResult && (
            <div className={`rounded-xl border p-4 ${uploadResult.uploaded > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-start gap-3">
                {uploadResult.uploaded > 0 ? <CheckCircle className="w-5 h-5 text-green-600 shrink-0" /> : <XCircle className="w-5 h-5 text-red-600 shrink-0" />}
                <div>
                  <h4 className={`font-semibold text-sm ${uploadResult.uploaded > 0 ? 'text-green-800' : 'text-red-800'}`}>
                    Upload Complete
                  </h4>
                  <div className="mt-2 space-y-1 text-sm text-gray-700">
                    <p>Total Processed: <span className="font-medium">{uploadResult.total}</span></p>
                    <p className="text-green-600">Successfully Inserted: <span className="font-medium">{uploadResult.uploaded}</span></p>
                    <p className="text-yellow-600">Skipped (Duplicates): <span className="font-medium">{uploadResult.skipped}</span></p>
                    {uploadResult.failed > 0 && <p className="text-red-600">Errors: <span className="font-medium">{uploadResult.failed}</span></p>}
                  </div>
                  {uploadResult.errors?.length > 0 && (
                    <div className="mt-3 text-xs text-red-600 bg-red-100/50 p-2 rounded-md">
                      <p className="font-medium mb-1">Error Log (Top 10):</p>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {uploadResult.errors.map((err, i) => (
                          <li key={i}>Row {err.row}: {err.message}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{editingSubject ? 'Edit Subject' : 'Add Subject'}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSaveSubject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                  placeholder="e.g. CS301"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Database Management Systems"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <select
                  required
                  value={formData.department}
                  onChange={e => setFormData({...formData, department: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Select Department...</option>
                  {validBranches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                  <input
                    type="number"
                    value={formData.semester}
                    onChange={e => setFormData({...formData, semester: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. 5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.credits}
                    onChange={e => setFormData({...formData, credits: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. 4"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Regulation</label>
                <input
                  type="text"
                  value={formData.regulation}
                  onChange={e => setFormData({...formData, regulation: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                  placeholder="e.g. R23"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm">
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectManagement;
