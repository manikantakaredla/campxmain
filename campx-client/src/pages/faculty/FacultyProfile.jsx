import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { User, Mail, Phone, Briefcase, Building, Calendar } from 'lucide-react'

const FacultyProfile = () => {
  const { user } = useAuth()

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-500 mt-1">View your profile information</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 max-w-2xl">
        <div className="p-6 border-b border-gray-100 flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">{user?.name?.charAt(0) || 'F'}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
            <p className="text-gray-500 capitalize">{user?.role}</p>
            <p className="text-sm text-gray-400">{user?.employeeId}</p>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-800">{user?.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-gray-800">{user?.phoneNumber || 'Not provided'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Designation</p>
              <p className="text-gray-800">{user?.designation || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Building className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Department</p>
              <p className="text-gray-800">{user?.department || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Joined</p>
              <p className="text-gray-800">{new Date(user?.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FacultyProfile