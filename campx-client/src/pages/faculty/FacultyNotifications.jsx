import React from 'react'
import { Bell } from 'lucide-react'

const FacultyNotifications = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        <p className="text-gray-500 mt-1">Stay updated with latest updates</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600">No notifications yet</h3>
        <p className="text-gray-400 mt-1">You're all caught up!</p>
      </div>
    </div>
  )
}

export default FacultyNotifications