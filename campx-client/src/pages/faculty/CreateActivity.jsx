import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const CreateActivity = () => {
  const navigate = useNavigate()
  
  useEffect(() => {
    navigate('/faculty/activities')
  }, [navigate])
  
  return null
}

export default CreateActivity