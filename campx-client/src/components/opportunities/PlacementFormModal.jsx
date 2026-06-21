import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, User, Briefcase, GraduationCap } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';
import { createPlacement, updatePlacement } from '../../services/placementService';
import toast from 'react-hot-toast';

const PlacementFormModal = ({ isOpen, onClose, record, onRefresh }) => {
  const isEdit = !!record;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const initialFormState = {
    studentName: '',
    rollNumber: '',
    companyName: '',
    package: '',
    role: '',
    placementYear: new Date().getFullYear(),
    offerType: 'Placement',
    offerStatus: 'Selected',
    offerDate: '',
    linkedinUrl: '',
    gender: '',
    college: '',
    mobileNumber: '',
    email: '',
    department: '',
    batch: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (record) {
      // Map existing record values
      setFormData({
        studentName: record.studentName || '',
        rollNumber: record.rollNumber || '',
        companyName: record.companyName || '',
        package: record.package || '',
        role: record.role || '',
        placementYear: record.placementYear || new Date().getFullYear(),
        offerType: record.offerType || 'Placement',
        offerStatus: record.offerStatus || 'Selected',
        offerDate: record.offerDate ? record.offerDate.split('T')[0] : '',
        linkedinUrl: record.linkedinUrl || '',
        gender: record.gender || '',
        college: record.college || '',
        mobileNumber: record.mobileNumber || '',
        email: record.email || '',
        department: record.department || '',
        batch: record.batch || ''
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
  }, [record, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.studentName.trim()) newErrors.studentName = 'Student name is required';
    if (!formData.rollNumber.trim()) newErrors.rollNumber = 'Roll number is required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.package || isNaN(formData.package) || Number(formData.package) <= 0) {
      newErrors.package = 'Package must be a valid positive number';
    }
    if (!formData.placementYear || isNaN(formData.placementYear)) {
      newErrors.placementYear = 'Placement year is required';
    }

    if (formData.linkedinUrl.trim()) {
      const regex = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_\-\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\/|\?|$)/i;
      if (!regex.test(formData.linkedinUrl)) {
        newErrors.linkedinUrl = 'Invalid LinkedIn URL format (must be https://www.linkedin.com/in/username)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix form validation errors.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        package: Number(formData.package),
        placementYear: Number(formData.placementYear),
        linkedinUrl: formData.linkedinUrl.trim() || null,
        offerDate: formData.offerDate || undefined
      };

      if (isEdit) {
        await updatePlacement(record._id, payload);
        toast.success('Placement record updated successfully!');
      } else {
        await createPlacement(payload);
        toast.success('Placement record created successfully!');
      }
      onRefresh();
      onClose();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to save record';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <form 
          onSubmit={handleSubmit}
          className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-3xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        >
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-4 flex justify-between items-center text-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-blue-200" />
              <div>
                <h3 className="text-lg font-bold leading-6">{isEdit ? 'Edit Placement Record' : 'Add Placement Record'}</h3>
                <p className="text-xs text-blue-100">{isEdit ? 'Update student career record details' : 'Enter a new student placement detail manually'}</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 hover:bg-blue-800 text-blue-100 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form Fields container (scrollable) */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            
            {/* SECTION 1: Student Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                <User size={16} className="text-blue-500" />
                Student Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Student Name *</label>
                  <input
                    type="text"
                    name="studentName"
                    required
                    value={formData.studentName}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                      errors.studentName 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } bg-white`}
                    placeholder="e.g. John Doe"
                  />
                  {errors.studentName && <p className="mt-1 text-xs text-red-500">{errors.studentName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Roll Number *</label>
                  <input
                    type="text"
                    name="rollNumber"
                    required
                    value={formData.rollNumber}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                      errors.rollNumber 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } bg-white`}
                    placeholder="e.g. 22A91A0501"
                  />
                  {errors.rollNumber && <p className="mt-1 text-xs text-red-500">{errors.rollNumber}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select...</option>
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 bg-white"
                    placeholder="student@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Mobile Number</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 bg-white"
                    placeholder="10-digit mobile"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Batch</label>
                  <input
                    type="text"
                    name="batch"
                    value={formData.batch}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 bg-white"
                    placeholder="e.g. 2022-2026"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">College</label>
                  <input
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 bg-white"
                    placeholder="e.g. AEC, ACET, ACOE"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Career Placement Details */}
            <div className="space-y-4 pt-2">
              <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                <Briefcase size={16} className="text-blue-500" />
                Career Placement Details
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Company *</label>
                  <input
                    type="text"
                    name="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                      errors.companyName 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } bg-white`}
                    placeholder="e.g. Google, TCS"
                  />
                  {errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Package (LPA) *</label>
                  <input
                    type="text"
                    name="package"
                    required
                    value={formData.package}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                      errors.package 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } bg-white`}
                    placeholder="e.g. 7.5"
                  />
                  {errors.package && <p className="mt-1 text-xs text-red-500">{errors.package}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Job Role / Designation</label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 bg-white"
                    placeholder="e.g. Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Placement Year *</label>
                  <input
                    type="number"
                    name="placementYear"
                    required
                    value={formData.placementYear}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                      errors.placementYear 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } bg-white`}
                    placeholder="e.g. 2026"
                  />
                  {errors.placementYear && <p className="mt-1 text-xs text-red-500">{errors.placementYear}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Offer Type</label>
                  <select
                    name="offerType"
                    value={formData.offerType}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 bg-white"
                  >
                    <option value="Placement">Placement</option>
                    <option value="Internship">Internship</option>
                    <option value="PPO">PPO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Offer Status</label>
                  <select
                    name="offerStatus"
                    value={formData.offerStatus}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 bg-white"
                  >
                    <option value="Selected">Selected</option>
                    <option value="Joined">Joined</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Placement Date</label>
                  <input
                    type="date"
                    name="offerDate"
                    value={formData.offerDate}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: Professional Profiles */}
            <div className="space-y-4 pt-2">
              <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                <FaLinkedin size={16} className="text-blue-500" />
                Professional Profiles
              </h4>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">LinkedIn Profile URL</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FaLinkedin size={16} />
                    </div>
                    <input
                      type="url"
                      name="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleChange}
                      className={`block w-full pl-10 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                        errors.linkedinUrl 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                      } bg-white`}
                      placeholder="https://www.linkedin.com/in/username"
                    />
                  </div>
                  {errors.linkedinUrl ? (
                    <p className="mt-1 text-xs text-red-500">{errors.linkedinUrl}</p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-400">Optional. Validated pattern matches: https://www.linkedin.com/in/username</p>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Footer Action buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="h-4 w-4" /> Save Record</>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default PlacementFormModal;
