import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useSettings } from '../../hooks/useSettings';

const ClassSectionAssignmentsTab = () => {
  const [assignments, setAssignments] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();
  
  const [formData, setFormData] = useState({
    facultyId: '',
    department: '',
    year: '',
    sections: []
  });
  
  const branches = settings?.branchConfigs?.map(c => c.branch) || [];
  const selectedBranchConfig = settings?.branchConfigs?.find(c => c.branch === formData.department);
  const availableYears = selectedBranchConfig?.years ? Object.keys(selectedBranchConfig.years).sort() : [];
  
  const sectionsList = (selectedBranchConfig?.years && formData.year) 
    ? (selectedBranchConfig.years[formData.year] || []) 
    : (settings?.sections || ['A', 'B', 'C', 'D']);

  const handleDepartmentChange = (e) => {
    setFormData({
      ...formData,
      department: e.target.value,
      year: '',
      sections: []
    });
  };

  const handleYearChange = (e) => {
    setFormData({
      ...formData,
      year: e.target.value,
      sections: []
    });
  };
  
  const fetchAssignments = async () => {
    try {
      const res = await api.get('/hod/assignments/sections');
      setAssignments(res.data.assignments);
    } catch (err) {
      toast.error('Failed to load assignments');
    }
  };

  const fetchFaculty = async () => {
    try {
      const res = await api.get('/hod/faculty');
      setFacultyList(res.data.faculty);
      if (res.data.faculty.length > 0 && res.data.department && res.data.department !== "All") {
        setFormData(prev => ({ ...prev, department: res.data.department }));
      }
    } catch (err) {
      toast.error('Failed to load faculty');
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchAssignments(), fetchFaculty()]).finally(() => setLoading(false));
  }, []);

  const handleSectionToggle = (sec) => {
    setFormData(prev => {
      if (prev.sections.includes(sec)) {
        return { ...prev, sections: prev.sections.filter(s => s !== sec) };
      }
      return { ...prev, sections: [...prev.sections, sec] };
    });
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!formData.facultyId || !formData.department || !formData.year || formData.sections.length === 0) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      const previewRes = await api.post('/hod/assignments/preview', formData);
      const warnings = previewRes.data.sectionPreviews.filter(p => p.isReassignment);
      if (warnings.length > 0) {
        const proceed = window.confirm(`Warning: Some sections are already assigned to other faculty. Reassign?`);
        if (!proceed) return;
      }
      
      const res = await api.post('/hod/assignments/sections', formData);
      toast.success(res.data.message);
      setFormData(prev => ({ ...prev, sections: [] }));
      fetchAssignments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this assignment?")) return;
    try {
      await api.delete(`/hod/assignments/sections/${id}`);
      toast.success("Assignment removed");
      fetchAssignments();
    } catch (err) {
      toast.error("Failed to remove assignment");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading assignments...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-2 text-gray-600">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <h3 className="font-medium text-sm uppercase tracking-wider text-gray-500">Total Sections</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">{assignments.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-2 text-gray-600">
            <Users className="w-5 h-5 text-indigo-500" />
            <h3 className="font-medium text-sm uppercase tracking-wider text-gray-500">Students Covered</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">{assignments.reduce((sum, a) => sum + (a.studentCount || 0), 0)}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
        <h3 className="text-lg font-semibold mb-5 text-gray-800">Assign New Sections</h3>
        <form onSubmit={handleAssign} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
            <select 
              value={formData.department} 
              onChange={handleDepartmentChange}
              className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="">Select Department</option>
              {branches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Year</label>
            <select 
              value={formData.year} 
              onChange={handleYearChange}
              className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              disabled={!formData.department}
            >
              <option value="">Select Year</option>
              {availableYears.map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Faculty</label>
            <select 
              value={formData.facultyId} 
              onChange={e => setFormData({...formData, facultyId: e.target.value})}
              className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="">Select Faculty</option>
              {facultyList.map(f => <option key={f._id} value={f._id}>{f.name} ({f.employeeId})</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Sections</label>
            <div className="flex flex-wrap gap-2">
              {sectionsList.map(sec => (
                <button
                  type="button"
                  key={sec}
                  onClick={() => handleSectionToggle(sec)}
                  className={`px-5 py-2.5 rounded-lg border font-medium transition-all ${
                    formData.sections.includes(sec) 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  Section {sec}
                </button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 mt-3 pt-4 border-t border-gray-100">
            <button 
              type="submit" 
              className="w-full md:w-auto px-8 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95"
            >
              Assign Selected Sections
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Current Assignments</h3>
          <span className="text-xs bg-white px-3 py-1 rounded-full border text-gray-600 font-medium">{assignments.length} Total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-gray-500 border-b">
              <tr>
                <th className="p-4 font-medium">Batch</th>
                <th className="p-4 font-medium">Class</th>
                <th className="p-4 font-medium">Faculty</th>
                <th className="p-4 font-medium">Students</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assignments.map(assignment => (
                <tr key={assignment._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-600">{assignment.batch}</td>
                  <td className="p-4 font-medium text-gray-800">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs mr-2 border">{assignment.department}</span>
                    Yr {assignment.year} - Sec <span className="text-blue-600 font-bold">{assignment.section}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-sm">
                        {assignment.facultyId?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{assignment.facultyId?.name}</p>
                        <p className="text-xs text-gray-500">{assignment.facultyId?.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg text-gray-700 font-medium text-xs">
                      {assignment.studentCount || 0}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(assignment._id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Remove Assignment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {assignments.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-500">
                    <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-lg font-medium text-gray-800">No active assignments</p>
                    <p className="text-sm mt-1">Assign sections to faculty to see them here.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClassSectionAssignmentsTab;
