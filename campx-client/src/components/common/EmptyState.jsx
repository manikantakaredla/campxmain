import React from 'react'

export const EmptyState = ({ icon, title, description }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
      <div className="text-gray-300 mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-600">{title}</h3>
      <p className="text-gray-400 mt-1">{description}</p>
    </div>
  )
}