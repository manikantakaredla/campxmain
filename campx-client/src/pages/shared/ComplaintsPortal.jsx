import React, { useState } from 'react';
import { AlertCircle, FileText, CheckCircle2, Clock, Plus, Search, Filter, MessageSquare } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const ComplaintsPortal = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('new');
  
  const [formData, setFormData] = useState({
    category: 'Academics',
    subject: '',
    description: '',
    priority: 'Medium'
  });

  const [dummyComplaints, setDummyComplaints] = useState([
    {
      id: 'CMP-2023-001',
      category: 'Infrastructure',
      subject: 'Broken AC in Room 302',
      description: 'The air conditioning unit is leaking water and not cooling.',
      priority: 'High',
      status: 'Resolved',
      date: 'Oct 10, 2023',
      reply: 'Maintenance team has repaired the AC unit. Please confirm if working.'
    },
    {
      id: 'CMP-2023-002',
      category: 'Academics',
      subject: 'Discrepancy in Mid-Sem Marks',
      description: 'My DSA marks are showing as 12 instead of 21 in the portal.',
      priority: 'Medium',
      status: 'In Progress',
      date: 'Nov 02, 2023',
      reply: 'Forwarded to the examination branch for verification.'
    }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }
    
    const newComplaint = {
      id: `CMP-2023-00${dummyComplaints.length + 1}`,
      ...formData,
      status: 'Pending',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      reply: 'Your complaint has been registered and is pending review.'
    };
    
    setDummyComplaints([newComplaint, ...dummyComplaints]);
    toast.success('Complaint submitted successfully!');
    setFormData({ category: 'Academics', subject: '', description: '', priority: 'Medium' });
    setActiveTab('history');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved': return <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle2 size={12}/> Resolved</span>;
      case 'In Progress': return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center gap-1"><Clock size={12}/> In Progress</span>;
      default: return <span className="px-2.5 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium flex items-center gap-1"><AlertCircle size={12}/> Pending</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High': return <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">High Priority</span>;
      case 'Medium': return <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-100">Medium Priority</span>;
      default: return <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Low Priority</span>;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Complaints & Grievances</h1>
        <p className="text-gray-600 mt-1">Submit and track your requests, issues, and grievances.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button 
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${activeTab === 'new' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('new')}
          >
            <div className="flex items-center justify-center gap-2">
              <Plus size={18} /> File New Complaint
            </div>
          </button>
          <button 
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('history')}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText size={18} /> My History
            </div>
          </button>
        </div>

        <div className="p-6 md:p-8">
          {activeTab === 'new' ? (
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option>Academics</option>
                    <option>Infrastructure</option>
                    <option>Hostel & Mess</option>
                    <option>Examinations</option>
                    <option>Anti-Ragging</option>
                    <option>Others</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input 
                  type="text" 
                  placeholder="Brief summary of the issue"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Description</label>
                <textarea 
                  rows="5"
                  placeholder="Provide all relevant details to help us resolve the issue faster..."
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm shadow-blue-200 transition-all active:scale-[0.98]">
                  Submit Grievance
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <div className="relative max-w-sm w-full">
                  <input 
                    type="text" 
                    placeholder="Search by Ticket ID or Subject..." 
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                  <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                  <Filter size={16} /> Filter
                </button>
              </div>

              {dummyComplaints.map((complaint) => (
                <div key={complaint.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-gray-50/30">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">{complaint.id}</span>
                      {getStatusBadge(complaint.status)}
                      {getPriorityBadge(complaint.priority)}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock size={14} /> Submitted on {complaint.date}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{complaint.subject}</h3>
                  <p className="text-gray-600 text-sm mb-4">{complaint.description}</p>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5"><MessageSquare size={16} className="text-blue-500" /></div>
                      <div>
                        <p className="text-xs font-semibold text-blue-800 mb-1">Official Response</p>
                        <p className="text-sm text-gray-700 italic">{complaint.reply}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintsPortal;
