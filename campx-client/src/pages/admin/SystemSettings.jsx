import React, { useState, useEffect } from 'react';
import {
  Settings, Globe, Mail, Bell, Shield, Save, RefreshCw, Layers,
  Building, Phone, AtSign, ToggleLeft, ToggleRight, AlertCircle,
  Edit, Trash2, Plus, ChevronDown, ChevronRight, Database, Server,
  Users, UserCog, Link, Image, CheckCircle, XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    platformName: 'CAMPX',
    supportEmail: 'support@adityauniversity.in',
    contactEmail: 'support@adityauniversity.in',
    contactMobile: '',
    logoUrl: '',
    maintenanceMode: false,
    facultyRegistrationEnabled: true,
    emailDomain: '@adityauniversity.in',
    branchConfigs: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedBranches, setExpandedBranches] = useState({});
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data.settings);
      // Auto-expand all branches on load
      const expanded = {};
      (response.data.settings.branchConfigs || []).forEach((_, idx) => {
        expanded[idx] = true;
      });
      setExpandedBranches(expanded);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleBranch = (index) => {
    setExpandedBranches(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const addBranch = () => {
    const newBranch = prompt('Enter new branch name (e.g. B.Tech. - Computer Science and Engineering):');
    if (newBranch && newBranch.trim()) {
      setSettings(prev => ({
        ...prev,
        branchConfigs: [
          ...(prev.branchConfigs || []),
          {
            branch: newBranch.trim(),
            years: { '1': ['A', 'B'], '2': ['A', 'B'], '3': ['A', 'B'], '4': ['A', 'B'] }
          }
        ]
      }));
      // Expand the new branch
      setExpandedBranches(prev => ({
        ...prev,
        [(settings.branchConfigs || []).length]: true
      }));
      toast.success('Branch added successfully');
    }
  };

  const addSection = (branchIndex, year) => {
    const newSec = prompt(`Enter new section for Year ${year}:`);
    if (newSec && newSec.trim()) {
      setSettings(prev => {
        const newConfigs = [...prev.branchConfigs];
        if (!newConfigs[branchIndex].years) newConfigs[branchIndex].years = {};
        const yearData = [...(newConfigs[branchIndex].years[year] || [])];
        if (!yearData.includes(newSec.trim())) {
          yearData.push(newSec.trim());
          newConfigs[branchIndex].years = {
            ...newConfigs[branchIndex].years,
            [year]: yearData.sort()
          };
        } else {
          toast.error('Section already exists');
        }
        return { ...prev, branchConfigs: newConfigs };
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading settings...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'academic', label: 'Academic Master', icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-gray-50/80 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Settings className="w-7 h-7 text-indigo-600" />
                System Settings
              </h1>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <span className="text-sm">Configure platform settings and academic structure</span>
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="flex flex-wrap border-b border-gray-100">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all border-b-2 ${
                    isActive
                      ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2 text-lg">
                <Server className="w-5 h-5 text-indigo-600" />
                Platform Configuration
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Platform Name */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-400" />
                  Platform Name
                </label>
                <input
                  type="text"
                  name="platformName"
                  value={settings.platformName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50/50 hover:bg-white"
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    Support Email
                  </label>
                  <input
                    type="email"
                    name="supportEmail"
                    value={settings.supportEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50/50 hover:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <AtSign className="w-4 h-4 text-gray-400" />
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={settings.contactEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50/50 hover:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    Contact Mobile
                  </label>
                  <input
                    type="text"
                    name="contactMobile"
                    value={settings.contactMobile}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50/50 hover:bg-white"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <Link className="w-4 h-4 text-gray-400" />
                    Email Domain
                  </label>
                  <input
                    type="text"
                    name="emailDomain"
                    value={settings.emailDomain}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50/50 hover:bg-white"
                  />
                  <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Students and faculty must use this domain for registration
                  </p>
                </div>
              </div>

              {/* Logo URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                  <Image className="w-4 h-4 text-gray-400" />
                  Logo URL
                </label>
                <input
                  type="text"
                  name="logoUrl"
                  value={settings.logoUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50/50 hover:bg-white"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              {/* Toggle Switches */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium text-gray-800 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-500" />
                      Maintenance Mode
                    </p>
                    <p className="text-sm text-gray-500">When enabled, only admins can access the platform</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
                    className={`relative w-12 h-7 rounded-full transition-all flex items-center ${
                      settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${
                        settings.maintenanceMode ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium text-gray-800 flex items-center gap-2">
                      <UserCog className="w-4 h-4 text-green-600" />
                      Faculty Registration
                    </p>
                    <p className="text-sm text-gray-500">Allow faculty to self-register</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, facultyRegistrationEnabled: !prev.facultyRegistrationEnabled }))}
                    className={`relative w-12 h-7 rounded-full transition-all flex items-center ${
                      settings.facultyRegistrationEnabled ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${
                        settings.facultyRegistrationEnabled ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Academic Master Tab */}
        {activeTab === 'academic' && (
          <div className="space-y-6">
            {/* Branch Management Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2 text-lg">
                    <Database className="w-5 h-5 text-indigo-600" />
                    Academic Structure
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Manage branches, years, and sections
                  </p>
                </div>
                <button
                  onClick={addBranch}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Add Branch
                </button>
              </div>

              {/* Branch List */}
              <div className="divide-y divide-gray-100">
                {(settings.branchConfigs || []).length === 0 ? (
                  <div className="p-12 text-center">
                    <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400">No branches configured yet</p>
                    <button
                      onClick={addBranch}
                      className="mt-3 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                    >
                      Add your first branch →
                    </button>
                  </div>
                ) : (
                  (settings.branchConfigs || []).map((config, index) => {
                    const isExpanded = expandedBranches[index] !== false;
                    const totalSections = Object.values(config.years || {}).reduce(
                      (sum, sections) => sum + sections.length,
                      0
                    );

                    return (
                      <div key={index} className="bg-white hover:bg-gray-50/30 transition-colors">
                        {/* Branch Header */}
                        <div
                          className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer"
                          onClick={() => toggleBranch(index)}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                              {isExpanded ? (
                                <ChevronDown className="w-5 h-5" />
                              ) : (
                                <ChevronRight className="w-5 h-5" />
                              )}
                            </button>
                            <div>
                              <h3 className="font-semibold text-gray-800 text-base truncate">
                                {config.branch}
                              </h3>
                              <p className="text-xs text-gray-400 flex items-center gap-3">
                                <span>{Object.keys(config.years || {}).length} years</span>
                                <span className="w-px h-3 bg-gray-200" />
                                <span>{totalSections} sections total</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-auto" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                const newName = prompt('Enter new branch name:', config.branch);
                                if (newName && newName.trim()) {
                                  setSettings(prev => {
                                    const newConfigs = [...prev.branchConfigs];
                                    newConfigs[index] = { ...newConfigs[index], branch: newName.trim() };
                                    return { ...prev, branchConfigs: newConfigs };
                                  });
                                  toast.success('Branch renamed');
                                }
                              }}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to remove "${config.branch}" entirely?`)) {
                                  setSettings(prev => ({
                                    ...prev,
                                    branchConfigs: prev.branchConfigs.filter((_, i) => i !== index)
                                  }));
                                  toast.success('Branch removed');
                                }
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Branch Content */}
                        {isExpanded && (
                          <div className="px-6 pb-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              {['1', '2', '3', '4'].map(year => {
                                const sections = config.years?.[year] || [];
                                return (
                                  <div
                                    key={year}
                                    className="bg-gray-50/70 rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors"
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <h4 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                                        <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">
                                          {year}
                                        </span>
                                        Year {year}
                                      </h4>
                                      <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                                        {sections.length} sections
                                      </span>
                                    </div>

                                    <div className="space-y-1.5">
                                      {sections.length === 0 ? (
                                        <p className="text-xs text-gray-400 text-center py-3">No sections</p>
                                      ) : (
                                        sections.map((section, secIndex) => (
                                          <div
                                            key={secIndex}
                                            className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow group"
                                          >
                                            <span className="text-sm font-medium text-gray-700">
                                              Section {section}
                                            </span>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <button
                                                onClick={() => {
                                                  const newSec = prompt('Rename section:', section);
                                                  if (newSec && newSec.trim()) {
                                                    setSettings(prev => {
                                                      const newConfigs = [...prev.branchConfigs];
                                                      const yearData = [...(newConfigs[index].years[year] || [])];
                                                      yearData[secIndex] = newSec.trim();
                                                      newConfigs[index].years = {
                                                        ...newConfigs[index].years,
                                                        [year]: yearData
                                                      };
                                                      return { ...prev, branchConfigs: newConfigs };
                                                    });
                                                    toast.success('Section renamed');
                                                  }
                                                }}
                                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                              >
                                                <Edit className="w-3 h-3" />
                                              </button>
                                              <button
                                                onClick={() => {
                                                  if (window.confirm(`Delete Section ${section}?`)) {
                                                    setSettings(prev => {
                                                      const newConfigs = [...prev.branchConfigs];
                                                      const yearData = [...(newConfigs[index].years[year] || [])];
                                                      yearData.splice(secIndex, 1);
                                                      newConfigs[index].years = {
                                                        ...newConfigs[index].years,
                                                        [year]: yearData
                                                      };
                                                      return { ...prev, branchConfigs: newConfigs };
                                                    });
                                                    toast.success('Section deleted');
                                                  }
                                                }}
                                                className="text-gray-400 hover:text-red-600 transition-colors"
                                              >
                                                <XCircle className="w-3 h-3" />
                                              </button>
                                            </div>
                                          </div>
                                        ))
                                      )}
                                    </div>

                                    <button
                                      onClick={() => addSection(index, year)}
                                      className="w-full mt-3 py-1.5 text-xs text-indigo-600 border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 rounded-lg transition-colors font-medium flex items-center justify-center gap-1"
                                    >
                                      <Plus className="w-3 h-3" />
                                      Add Section
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400">Total Branches</p>
            <p className="text-xl font-bold text-gray-800">{(settings.branchConfigs || []).length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400">Total Years</p>
            <p className="text-xl font-bold text-gray-800">
              {(settings.branchConfigs || []).reduce((sum, b) => sum + Object.keys(b.years || {}).length, 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400">Total Sections</p>
            <p className="text-xl font-bold text-gray-800">
              {(settings.branchConfigs || []).reduce(
                (sum, b) => sum + Object.values(b.years || {}).reduce((s, sections) => s + sections.length, 0),
                0
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;