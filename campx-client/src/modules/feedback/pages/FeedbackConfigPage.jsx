import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import toast from 'react-hot-toast';
import { Save, Plus, Trash2 } from 'lucide-react';

const FeedbackConfigPage = () => {
  const [config, setConfig] = useState({
    startDate: '',
    endDate: '',
    isCollectionEnabled: false,
    isLoginAllowed: false,
    successMessage: ''
  });
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
    fetchQuestions();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/feedback/admin/config');
      if (res.data.config) {
        setConfig({
          ...res.data.config,
          startDate: res.data.config.startDate ? new Date(res.data.config.startDate).toISOString().slice(0, 16) : '',
          endDate: res.data.config.endDate ? new Date(res.data.config.endDate).toISOString().slice(0, 16) : '',
        });
      }
    } catch (error) {
      toast.error('Failed to fetch config');
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/feedback/admin/questions');
      setQuestions(res.data.questions);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch questions');
      setLoading(false);
    }
  };

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await api.put('/feedback/admin/config', config);
      toast.success('Configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save config');
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = async () => {
    try {
      const res = await api.post('/feedback/admin/questions', {
        questionText: 'New Question',
        order: questions.length + 1,
        type: 'scale'
      });
      setQuestions([...questions, res.data.question]);
      toast.success('Question added');
    } catch (error) {
      toast.error('Failed to add question');
    }
  };

  const handleUpdateQuestion = async (id, field, value) => {
    const updated = questions.map(q => q._id === id ? { ...q, [field]: value } : q);
    setQuestions(updated);
    
    // Auto save
    try {
      await api.put(`/feedback/admin/questions/${id}`, { [field]: value });
    } catch (error) {
      toast.error('Failed to update question');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    
    try {
      await api.delete(`/feedback/admin/questions/${id}`);
      setQuestions(questions.filter(q => q._id !== id));
      toast.success('Question deleted');
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Feedback Configuration</h1>
        <p className="text-gray-500">Manage feedback collection settings and questions</p>
      </div>

      {/* Settings Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
            <input
              type="datetime-local"
              name="startDate"
              value={config.startDate}
              onChange={handleConfigChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
            <input
              type="datetime-local"
              name="endDate"
              value={config.endDate}
              onChange={handleConfigChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isLoginAllowed"
              name="isLoginAllowed"
              checked={config.isLoginAllowed}
              onChange={handleConfigChange}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <label htmlFor="isLoginAllowed" className="text-sm font-medium text-gray-700">Allow Students to Request OTPs</label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isCollectionEnabled"
              name="isCollectionEnabled"
              checked={config.isCollectionEnabled}
              onChange={handleConfigChange}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <label htmlFor="isCollectionEnabled" className="text-sm font-medium text-gray-700">Enable Feedback Submission Form</label>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Success Message</label>
            <textarea
              name="successMessage"
              value={config.successMessage}
              onChange={handleConfigChange}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

        </div>
      </div>

      {/* Questions Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Feedback Questions</h2>
          <button
            onClick={handleAddQuestion}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
          >
            <Plus size={16} />
            Add Question
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {questions.map((q, index) => (
            <div key={q._id} className="flex gap-4 items-start p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Question Text</label>
                  <input
                    type="text"
                    value={q.questionText}
                    onChange={(e) => handleUpdateQuestion(q._id, 'questionText', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div className="flex gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Order</label>
                    <input
                      type="number"
                      value={q.order}
                      onChange={(e) => handleUpdateQuestion(q._id, 'order', Number(e.target.value))}
                      className="w-20 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDeleteQuestion(q._id)}
                className="p-2 text-red-500 hover:bg-red-100 rounded-lg mt-6 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          
          {questions.length === 0 && (
            <p className="text-gray-500 text-center py-4">No questions added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackConfigPage;
