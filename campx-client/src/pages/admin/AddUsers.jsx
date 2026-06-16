import React, { useState, useRef } from 'react'
import { Upload, UserPlus, CheckCircle, AlertCircle, FileText } from 'lucide-react'
import { useSettings } from '../../hooks/useSettings'
import api from '../../services/api'
import toast from 'react-hot-toast'

const AddUsers = () => {
  const { settings } = useSettings()
  const [activeTab, setActiveTab] = useState('individual')
  const [loading, setLoading] = useState(false)
  
  // Individual User form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    rollNumber: '',
    employeeId: '',
    branch: '',
    section: '',
    department: '',
    designation: ''
  })

  const departments = settings?.branchConfigs 
    ? settings.branchConfigs.map(c => c.branch) 
    : (settings?.branches || []);

  const getAvailableSections = () => {
    if (!settings?.branchConfigs) {
      return settings?.sections || [];
    }
    
    let targetBranch = formData.branch;
    
    // For students, try to calculate branch from roll number
    if (formData.role === 'student' && formData.rollNumber && formData.rollNumber.length >= 7) {
      const branchCode = formData.rollNumber.substring(5, 7).toUpperCase();
      const branchMapping = {
        CS: "CSE", EC: "ECE", EE: "EEE", ME: "Mechanical Engineering",
        CE: "Civil Engineering", IT: "IT", AI: "AI ML", DS: "Data Science",
        AG: "Agricultural Engineering"
      };
      // Try mapping, or search within branches
      targetBranch = branchMapping[branchCode];
    }
    
    const allSecs = new Set();
    
    if (targetBranch) {
      // Find branch config that matches (ignoring case)
      const config = settings.branchConfigs.find(c => 
        c.branch.toUpperCase() === targetBranch?.toUpperCase() || 
        c.branch.toUpperCase().includes(targetBranch?.toUpperCase())
      );
      
      if (config && config.years) {
        Object.values(config.years).forEach(secs => {
          if (Array.isArray(secs)) secs.forEach(s => allSecs.add(s));
        });
        return Array.from(allSecs).sort();
      }
    }
    
    // Fallback: return all sections from all branches
    settings.branchConfigs.forEach(config => {
      if (config.years) {
        Object.values(config.years).forEach(secs => {
          if (Array.isArray(secs)) secs.forEach(s => allSecs.add(s));
        });
      }
    });
    
    return Array.from(allSecs).sort();
  };

  const availableSections = getAvailableSections();

  // Bulk Upload state
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadResult, setUploadResult] = useState(null)

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleIndividualSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.post('/admin/users', formData)
      toast.success('User created successfully')
      // Reset form
      setFormData({
        name: '', email: '', password: '', role: 'student', 
        rollNumber: '', employeeId: '', branch: '', section: '', 
        department: '', designation: ''
      })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setUploadResult(null)
    }
  }

  const handleBulkUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file')
      return
    }

    setLoading(true)
    const fileData = new FormData()
    fileData.append('file', selectedFile)

    try {
      const response = await api.post('/admin/users/bulk', fileData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setUploadResult(response.data)
      toast.success('Bulk upload completed')
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed')
      setUploadResult({
        success: false,
        total: 0,
        uploaded: 0,
        failed: 1,
        errors: [{ row: 0, message: error.response?.data?.message || 'Upload failed' }]
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Add Users</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('individual')}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              activeTab === 'individual' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserPlus className="w-5 h-5 mx-auto mb-1" />
            Individual User
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              activeTab === 'bulk' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Upload className="w-5 h-5 mx-auto mb-1" />
            Bulk Upload
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'individual' ? (
            <form onSubmit={handleIndividualSubmit} className="max-w-2xl mx-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select name="role" required value={formData.role} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg">
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="hod">HOD</option>
                    <option value="admin">Admin</option>
                    <option value="dean">Dean</option>
                    <option value="principal">Principal</option>
                  </select>
                </div>

                {formData.role === 'student' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number *</label>
                      <input type="text" name="rollNumber" required value={formData.rollNumber} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                      <select name="section" value={formData.section} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg">
                        <option value="">Select Section</option>
                        {availableSections.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </>
                )}

                {['faculty', 'hod', 'dean', 'principal'].includes(formData.role) && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
                      <input type="text" name="employeeId" required value={formData.employeeId} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <select name="department" value={formData.department} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg">
                        <option value="">Select Department</option>
                        {departments.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                      <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                  </>
                )}
              </div>
              <button type="submit" disabled={loading} className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </form>
          ) : (
            <div className="max-w-3xl mx-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-blue-800 mb-2">CSV Format Guidelines:</h3>
                <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                  <li><strong>Required Columns:</strong> name, email, password, role</li>
                  <li><strong>For Students:</strong> rollNumber, section</li>
                  <li><strong>For Staff:</strong> employeeId, department, designation</li>
                  <li><strong>Valid Roles:</strong> student, faculty, hod, admin, dean, principal</li>
                </ul>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv,.xlsx"
                  className="hidden"
                  id="bulk-upload"
                />
                <label
                  htmlFor="bulk-upload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-4"
                >
                  <div className="p-4 bg-primary-50 rounded-full text-primary-600">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-primary-600 font-medium">Click to upload</span>
                    <span className="text-gray-500"> or drag and drop</span>
                  </div>
                  <p className="text-sm text-gray-400">CSV or Excel files only</p>
                </label>

                {selectedFile && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{selectedFile.name}</span>
                    <button
                      onClick={handleBulkUpload}
                      disabled={loading}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                      {loading ? 'Uploading...' : 'Upload Data'}
                    </button>
                  </div>
                )}
              </div>

              {uploadResult && (
                <div className="mt-8 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="text-gray-500 text-sm">Total Rows</div>
                      <div className="text-2xl font-bold text-gray-800">{uploadResult.total}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="text-green-600 text-sm">Successfully Uploaded</div>
                      <div className="text-2xl font-bold text-green-700">{uploadResult.uploaded}</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <div className="text-red-600 text-sm">Failed</div>
                      <div className="text-2xl font-bold text-red-700">{uploadResult.failed}</div>
                    </div>
                  </div>

                  {uploadResult.errors?.length > 0 && (
                    <div className="bg-white border border-red-200 rounded-lg overflow-hidden">
                      <div className="bg-red-50 px-4 py-3 border-b border-red-200 flex items-center text-red-700 font-medium">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Errors (showing up to 10)
                      </div>
                      <div className="divide-y divide-gray-200">
                        {uploadResult.errors.map((error, idx) => (
                          <div key={idx} className="p-4 flex gap-4">
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium h-fit">
                              Row {error.row}
                            </span>
                            <div>
                              <div className="font-medium text-gray-900">{error.identifier}</div>
                              <div className="text-sm text-red-600">{error.message}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AddUsers
