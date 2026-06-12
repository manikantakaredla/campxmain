import React, { useEffect } from 'react'
import { useSettings } from '../../hooks/useSettings'
import { useNavigate } from 'react-router-dom'

const EditResource = () => {
  const navigate = useNavigate()
  
  useEffect(() => {
    navigate('/faculty/resources')
  }, [navigate])
  
  return null
}

export default EditResource