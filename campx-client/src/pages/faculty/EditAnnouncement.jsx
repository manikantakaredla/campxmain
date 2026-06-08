import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const EditAnnouncement = () => {
  const navigate = useNavigate()
  
  useEffect(() => {
    // Redirect to MyAnnouncements which has the modal
    navigate('/faculty/announcements')
  }, [navigate])
  
  return null
}

export default EditAnnouncement