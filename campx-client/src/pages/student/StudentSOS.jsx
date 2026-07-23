import React, { useState } from 'react'
import {
  ShieldAlert,
  HeartPulse,
  Shield,
  Home,
  Phone,
  Share,
  X,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'

const SOS_CATEGORIES = [
  {
    id: 'security',
    title: 'Call Security',
    icon: ShieldAlert,
    color: 'orange',
    contacts: ['+1 (555) 888-0001']
  },
  {
    id: 'medical',
    title: 'Medical Help',
    icon: HeartPulse,
    color: 'red',
    contacts: ['+1 (555) 911-0001']
  },
  {
    id: 'womens-safety',
    title: 'Women Safety',
    icon: Shield,
    color: 'pink',
    contacts: ['+1 (555) 109-0000']
  },
  {
    id: 'hostel',
    title: 'Hostel Warden',
    icon: Home,
    color: 'orange',
    contacts: ['+1 (555) 444-0000']
  }
]

const StudentSOS = () => {
  const [activeModal, setActiveModal] = useState(null)
  const [alertSent, setAlertSent] = useState(false)
  const [isPressing, setIsPressing] = useState(false)

  const handleOpenModal = (category) => {
    setActiveModal(category)
    setAlertSent(false)
  }

  const handleSendAlert = () => {
    setTimeout(() => {
      setAlertSent(true)
    }, 800)
  }

  const handleSosPress = () => {
    setIsPressing(true)
    setTimeout(() => {
      setIsPressing(false)
      setAlertSent(true)
    }, 1500)
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-24 flex flex-col">
      
      {/* Massive Hero Section */}
      <div className="bg-gradient-to-b from-[#EF4444] to-[#B91C1C] rounded-b-[40px] pt-12 pb-16 px-4 shadow-[0_10px_40px_rgba(239,68,68,0.3)] relative overflow-hidden">
        {/* Soft glowing circles in background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-md mx-auto text-center relative z-10">
          <h1 className="text-3xl font-black text-white mb-2">Emergency?</h1>
          <p className="text-red-100 font-medium mb-10 text-sm">We are here to help!</p>
          
          {/* Giant SOS Button */}
          <div className="flex justify-center mb-4">
            <button 
              onMouseDown={() => setIsPressing(true)}
              onMouseUp={handleSosPress}
              onTouchStart={() => setIsPressing(true)}
              onTouchEnd={handleSosPress}
              className={`relative flex items-center justify-center w-48 h-48 rounded-full bg-white shadow-[0_0_60px_rgba(255,255,255,0.4)] transition-all duration-300 ${isPressing ? 'scale-95 shadow-[0_0_30px_rgba(255,255,255,0.6)]' : 'hover:scale-105'}`}
            >
              {/* Outer pulsing ring */}
              <div className={`absolute inset-0 rounded-full border-4 border-white opacity-50 ${!isPressing ? 'animate-ping' : ''}`}></div>
              
              <div className="flex flex-col items-center justify-center bg-gradient-to-br from-red-500 to-red-600 w-40 h-40 rounded-full shadow-inner">
                <span className="text-5xl font-black text-white tracking-widest drop-shadow-md">SOS</span>
                <span className="text-[10px] font-bold text-red-100 uppercase tracking-widest mt-2">Tap to Alert</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto w-full px-4 sm:px-6 mt-8">
        <h2 className="text-sm font-bold text-gray-900 mb-4 px-2">Quick Actions</h2>
        
        {/* Quick Action Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {SOS_CATEGORIES.map((cat) => {
            const Icon = cat.icon
            return (
              <button
                key={cat.id}
                onClick={() => handleOpenModal(cat)}
                className="flex flex-col items-center justify-center gap-2"
              >
                <div className={`w-14 h-14 rounded-[20px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center text-${cat.color}-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all`}>
                  <Icon size={24} />
                </div>
                <span className="text-[10px] font-bold text-gray-600 text-center leading-tight">
                  {cat.title.split(' ').map((word, i) => <React.Fragment key={i}>{word}<br/></React.Fragment>)}
                </span>
              </button>
            )
          })}
        </div>

        {/* Share Location Button */}
        <button className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-4 rounded-[24px] font-bold text-sm hover:bg-blue-100 transition-colors border border-blue-100">
          <Share size={18} />
          Share Live Location
        </button>
      </div>

      {/* Action/Success Modal */}
      {(activeModal || alertSent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-sm overflow-hidden transform transition-all relative">
            <button 
              onClick={() => { setActiveModal(null); setAlertSent(false) }} 
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full transition-colors z-10"
            >
              <X size={16} />
            </button>
            
            <div className="p-8 text-center">
              {alertSent ? (
                <>
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full mb-6 shadow-[0_8px_30px_rgba(34,197,94,0.2)]">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Alert Sent</h3>
                  <p className="text-gray-500 font-medium text-sm">
                    Campus authorities have been notified of your location. Help is on the way.
                  </p>
                </>
              ) : activeModal && (
                <>
                  <div className={`inline-flex items-center justify-center w-20 h-20 bg-${activeModal.color}-100 text-${activeModal.color}-600 rounded-full mb-6`}>
                    <activeModal.icon size={40} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-6">{activeModal.title}</h3>
                  <div className="space-y-3">
                    {activeModal.contacts.map((contact, idx) => (
                      <a 
                        key={idx}
                        href={`tel:${contact}`}
                        className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white shadow-md transition-all 
                          ${activeModal.color === 'red' ? 'bg-red-600 hover:bg-red-700' : ''}
                          ${activeModal.color === 'orange' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                          ${activeModal.color === 'pink' ? 'bg-pink-600 hover:bg-pink-700' : ''}
                        `}
                      >
                        <Phone size={18} />
                        Call {contact}
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default StudentSOS
