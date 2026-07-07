import React, { useState, useEffect } from 'react'
import { X, BookOpen, Users, UserCheck, Activity, Briefcase, Plus, Trash2, Award } from 'lucide-react'
import facultyManagementService from '../../services/facultyManagementService'
import subjectService from '../../services/subjectService'
import { Loader } from '../common/Loader'
import toast from 'react-hot-toast'
import api from '../../services/api'

const FacultyDetailsModal = ({ facultyId, onClose }) => {
  const [faculty, setFaculty] = useState(null)
  const [classAssignments, setClassAssignments] = useState([])
  const [proctorAssignments, setProctorAssignments] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  // Subject assignment states
  const [allSubjects, setAllSubjects] = useState([])
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false)
  const [subjectType, setSubjectType] = useState('primary')
  const [selectedSubjectId, setSelectedSubjectId] = useState('')

  useEffect(() => {
    fetchFacultyDetails()
    fetchAllSubjects()
  }, [facultyId])

  const fetchFacultyDetails = async () => {
    try {
      setLoading(true)
      const res = await facultyManagementService.getFacultyDetails(facultyId)
      if (res.success) {
        setFaculty(res.faculty)
        setClassAssignments(res.classAssignments || [])
        setProctorAssignments(res.proctorAssignments || [])
      }
    } catch (error) {
      toast.error('Failed to load faculty details')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const fetchAllSubjects = async () => {
    try {
      // In a real scenario we could filter by department, but we fetch all and filter in UI
      const res = await subjectService.getSubjects()
      if (res.success) {
        setAllSubjects(res.subjects || [])
      }
    } catch (error) {
      console.error('Failed to fetch subjects')
    }
  }

  const handleRemoveSubject = async (subjectId, type) => {
    try {
      // type is either 'primary' or 'secondary'
      const primaryIds = faculty.facultySubjects?.primary?.map(s => s._id) || []
      const secondaryIds = faculty.facultySubjects?.secondary?.map(s => s._id) || []

      const payload = {
        primary: type === 'primary' ? primaryIds.filter(id => id !== subjectId) : primaryIds,
        secondary: type === 'secondary' ? secondaryIds.filter(id => id !== subjectId) : secondaryIds
      }

      const res = await facultyManagementService.updateFacultySubjects(facultyId, payload)
      if (res.success) {
        toast.success('Subject removed')
        fetchFacultyDetails() // Refresh
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove subject')
    }
  }

  const handleAddSubject = async () => {
    if (!selectedSubjectId) return toast.error('Please select a subject')

    try {
      const primaryIds = faculty.facultySubjects?.primary?.map(s => s._id) || []
      const secondaryIds = faculty.facultySubjects?.secondary?.map(s => s._id) || []

      if (subjectType === 'primary' && !primaryIds.includes(selectedSubjectId)) {
        primaryIds.push(selectedSubjectId)
      } else if (subjectType === 'secondary' && !secondaryIds.includes(selectedSubjectId)) {
        secondaryIds.push(selectedSubjectId)
      }

      const payload = { primary: primaryIds, secondary: secondaryIds }
      const res = await facultyManagementService.updateFacultySubjects(facultyId, payload)
      
      if (res.success) {
        toast.success('Subject assigned successfully')
        setIsAddSubjectOpen(false)
        setSelectedSubjectId('')
        fetchFacultyDetails()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign subject')
    }
  }

  const isSameDepartment = (d1, d2) => {
    if (!d1 || !d2) return false;
    const s1 = d1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const s2 = d2.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (s1 === s2) return true;
    if (s1.includes(s2) || s2.includes(s1)) return true;
    
    const aliases = [
      ['cse', 'computerscience'],
      ['ece', 'electronicsandcommunication'],
      ['eee', 'electricalandelectronics'],
      ['it', 'informationtechnology'],
      ['mech', 'mechanical'],
      ['civil', 'civilengineering'],
      ['aiml', 'artificialintelligence'],
      ['ds', 'datascience']
    ];

    for (const group of aliases) {
      const match1 = group.some(alias => s1.includes(alias));
      const match2 = group.some(alias => s2.includes(alias));
      if (match1 && match2) return true;
    }
    return false;
  };

  // Filter subjects for the dropdown (exclude already assigned, only same department)
  const availableSubjects = allSubjects.filter(sub => {
    if (!isSameDepartment(sub.department, faculty?.department || faculty?.dept)) return false;
    const isPrimary = faculty?.facultySubjects?.primary?.some(s => s._id === sub._id)
    const isSecondary = faculty?.facultySubjects?.secondary?.some(s => s._id === sub._id)
    return !isPrimary && !isSecondary
  })

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl w-full max-w-4xl min-h-[400px] flex items-center justify-center">
          <Loader />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
          <div className="flex items-center gap-4">
            {faculty?.profilePicture ? (
              <img src={faculty.profilePicture} alt="" className="w-16 h-16 rounded-full object-cover shadow-sm border-2 border-white" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-sm border-2 border-white">
                {faculty?.name?.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{faculty?.name}</h2>
              <p className="text-gray-500 font-medium">{faculty?.employeeId} • {faculty?.designation} • {faculty?.department}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6 bg-white overflow-x-auto">
          {[
            { id: 'overview', icon: <Briefcase size={18} />, label: 'Overview' },
            { id: 'subjects', icon: <BookOpen size={18} />, label: 'Subjects' },
            { id: 'classes', icon: <Users size={18} />, label: 'Class Assignments' },
            { id: 'proctoring', icon: <UserCheck size={18} />, label: 'Proctoring' },
            { id: 'timeline', icon: <Activity size={18} />, label: 'Activity Timeline' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-4 font-medium transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-500" /> Basic Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium text-gray-800">{faculty?.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">Mobile</span>
                    <span className="font-medium text-gray-800">{faculty?.phoneNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">Status</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${faculty?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {faculty?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-500" /> Workload Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-blue-600 text-sm font-medium mb-1">Primary Subjects</p>
                    <p className="text-2xl font-bold text-blue-700">{faculty?.workload?.primarySubjectsCount || 0}</p>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                    <p className="text-indigo-600 text-sm font-medium mb-1">Secondary Subjects</p>
                    <p className="text-2xl font-bold text-indigo-700">{faculty?.workload?.secondarySubjectsCount || 0}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <p className="text-green-600 text-sm font-medium mb-1">Class Sections</p>
                    <p className="text-2xl font-bold text-green-700">{faculty?.workload?.assignedSectionsCount || 0}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                    <p className="text-orange-600 text-sm font-medium mb-1">Proctor Students</p>
                    <p className="text-2xl font-bold text-orange-700">{faculty?.workload?.proctorStudentsCount || 0}</p>
                  </div>
                </div>
              </div>

              {/* Special Roles Section */}
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-500" /> Special Roles / Permissions
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {[
                    { id: 'exam_controller', label: 'Exam Controller' },
                    { id: 'academics', label: 'Academics' },
                    { id: 'event_coordinator', label: 'Event Coordinator' },
                    { id: 'placement_coordinator', label: 'Placement Coordinator' },
                    { id: 'sports_coordinator', label: 'Sports Coordinator' },
                  ].map(role => (
                    <label key={role.id} className="flex items-center gap-2 p-2.5 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={(faculty?.specialRoles || []).includes(role.id)}
                        onChange={async (e) => {
                          const isChecked = e.target.checked;
                          const currentRoles = faculty?.specialRoles || [];
                          const newRoles = isChecked 
                            ? [...currentRoles, role.id] 
                            : currentRoles.filter(r => r !== role.id);
                          
                          // Optimistic update for instant feedback
                          setFaculty(prev => ({ ...prev, specialRoles: newRoles }));
                          
                          try {
                            const res = await api.put(`/admin/users/${facultyId}`, { specialRoles: newRoles });
                            if (res.data.success) {
                              toast.success('Special roles updated');
                            }
                          } catch (err) {
                            // Revert on failure
                            setFaculty(prev => ({ ...prev, specialRoles: currentRoles }));
                            toast.error('Failed to update special roles');
                          }
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">{role.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: SUBJECTS */}
          {activeTab === 'subjects' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div>
                  <h3 className="font-semibold text-gray-800">Subject Allocation</h3>
                  <p className="text-sm text-gray-500">Manage primary and secondary subjects</p>
                </div>
                <button
                  onClick={() => setIsAddSubjectOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  <Plus size={16} /> Assign Subject
                </button>
              </div>

              {isAddSubjectOpen && (
                <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm animate-fade-in-up">
                  <h4 className="font-medium text-gray-800 mb-4">Assign New Subject</h4>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                      <select 
                        className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        value={selectedSubjectId}
                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                      >
                        <option value="">-- Select Subject --</option>
                        {availableSubjects.map(sub => (
                          <option key={sub._id} value={sub._id}>
                            {sub.name} ({sub.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-full md:w-48">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select 
                        className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        value={subjectType}
                        onChange={(e) => setSubjectType(e.target.value)}
                      >
                        <option value="primary">Primary Subject</option>
                        <option value="secondary">Secondary Subject</option>
                      </select>
                    </div>
                    <div className="flex items-end gap-2">
                      <button onClick={handleAddSubject} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 h-[46px]">
                        Save
                      </button>
                      <button onClick={() => {setIsAddSubjectOpen(false); setSelectedSubjectId('')}} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 h-[46px]">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Primary Subjects */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
                    <span className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-500" /> Primary Subjects</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">{faculty?.facultySubjects?.primary?.length || 0}</span>
                  </h3>
                  <div className="space-y-3">
                    {(!faculty?.facultySubjects?.primary || faculty.facultySubjects.primary.length === 0) ? (
                      <p className="text-gray-400 text-sm italic py-4 text-center">No primary subjects assigned</p>
                    ) : (
                      faculty.facultySubjects.primary.map(sub => (
                        <div key={sub._id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg bg-gray-50 hover:bg-white hover:border-blue-200 transition-all group">
                          <div>
                            <p className="font-medium text-gray-800">{sub.name}</p>
                            <p className="text-xs text-gray-500">{sub.code} • Sem {sub.semester}</p>
                          </div>
                          <button onClick={() => handleRemoveSubject(sub._id, 'primary')} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Secondary Subjects */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
                    <span className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-500" /> Secondary Subjects</span>
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">{faculty?.facultySubjects?.secondary?.length || 0}</span>
                  </h3>
                  <div className="space-y-3">
                    {(!faculty?.facultySubjects?.secondary || faculty.facultySubjects.secondary.length === 0) ? (
                      <p className="text-gray-400 text-sm italic py-4 text-center">No secondary subjects assigned</p>
                    ) : (
                      faculty.facultySubjects.secondary.map(sub => (
                        <div key={sub._id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg bg-gray-50 hover:bg-white hover:border-indigo-200 transition-all group">
                          <div>
                            <p className="font-medium text-gray-800">{sub.name}</p>
                            <p className="text-xs text-gray-500">{sub.code} • Sem {sub.semester}</p>
                          </div>
                          <button onClick={() => handleRemoveSubject(sub._id, 'secondary')} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CLASSES */}
          {activeTab === 'classes' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                 <h3 className="font-semibold text-gray-800">Assigned Sections</h3>
                 <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">{classAssignments.length}</span>
               </div>
               {classAssignments.length === 0 ? (
                 <div className="p-8 text-center text-gray-500">No class sections assigned yet.</div>
               ) : (
                 <table className="w-full text-left">
                   <thead>
                     <tr className="border-b border-gray-100 text-sm text-gray-500">
                       <th className="p-4 font-medium">Department</th>
                       <th className="p-4 font-medium">Year</th>
                       <th className="p-4 font-medium">Section</th>
                       <th className="p-4 font-medium">Batch</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                     {classAssignments.map(ca => (
                       <tr key={ca._id} className="hover:bg-gray-50">
                         <td className="p-4 font-medium text-gray-800">{ca.department}</td>
                         <td className="p-4 text-gray-600">Year {ca.year}</td>
                         <td className="p-4 text-gray-600">{ca.section}</td>
                         <td className="p-4 text-gray-600">{ca.batch}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               )}
            </div>
          )}

          {/* TAB: PROCTORING */}
          {activeTab === 'proctoring' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                 <h3 className="font-semibold text-gray-800">Proctoring Assignments</h3>
                 <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">{proctorAssignments.reduce((sum, p) => sum + p.studentCount, 0)} Students</span>
               </div>
               {proctorAssignments.length === 0 ? (
                 <div className="p-8 text-center text-gray-500">No proctor students assigned yet.</div>
               ) : (
                 <table className="w-full text-left">
                   <thead>
                     <tr className="border-b border-gray-100 text-sm text-gray-500">
                       <th className="p-4 font-medium">Department</th>
                       <th className="p-4 font-medium">Year</th>
                       <th className="p-4 font-medium">Section</th>
                       <th className="p-4 font-medium">Student Count</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                     {proctorAssignments.map((pa, idx) => (
                       <tr key={idx} className="hover:bg-gray-50">
                         <td className="p-4 font-medium text-gray-800">{pa.department}</td>
                         <td className="p-4 text-gray-600">Year {pa.year}</td>
                         <td className="p-4 text-gray-600">{pa.section}</td>
                         <td className="p-4">
                           <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">{pa.studentCount} Students</span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               )}
            </div>
          )}

          {/* TAB: TIMELINE */}
          {activeTab === 'timeline' && (
             <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-800 mb-6">Activity Timeline</h3>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                  {/* Mock Activity Log since ActivityLog might not be fully wired up for subjects yet, but we requested it in API */}
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <Activity size={18} />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-gray-800">Profile Accessed</div>
                        <time className="text-xs font-medium text-gray-500">Just now</time>
                      </div>
                      <div className="text-gray-600 text-sm">Viewed faculty management dashboard.</div>
                    </div>
                  </div>
                  {/* More logs would map here */}
                  <div className="p-8 text-center text-gray-400 text-sm">More activity logs will appear here as the faculty member engages with the system.</div>
                </div>
             </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default FacultyDetailsModal
