import React, { useState } from 'react'
import {
  ShieldAlert,
  HeartPulse,
  Shield,
  Ban,
  Bus,
  Phone,
  AlertOctagon,
  X,
  MapPin,
  Clock,
  CheckCircle2
} from 'lucide-react'

const SOS_CATEGORIES = [
  {
    id: 'medical',
    title: 'Medical Emergency',
    icon: HeartPulse,
    color: 'red',
    description: 'Call an ambulance or reach the campus clinic immediately.',
    contacts: ['+1 (555) 911-0001', '+1 (555) 911-0002'],
    location: 'Campus Health Center, Block B'
  },
  {
    id: 'security',
    title: 'Campus Security',
    icon: ShieldAlert,
    color: 'orange',
    description: 'Report suspicious activity or request immediate security assistance.',
    contacts: ['+1 (555) 888-0001', '+1 (555) 888-0002'],
    location: 'Main Gate Security Office'
  },
  {
    id: 'womens-safety',
    title: "Women's Safety",
    icon: Shield,
    color: 'pink',
    description: 'Dedicated 24/7 helpline and rapid response team for women.',
    contacts: ['+1 (555) 109-0000'],
    location: 'Women Resource Center, Block A'
  },
  {
    id: 'anti-ragging',
    title: 'Anti-Ragging',
    icon: Ban,
    color: 'purple',
    description: 'Confidential reporting and immediate intervention for ragging incidents.',
    contacts: ['+1 (555) 444-0000'],
    location: "Dean of Students' Office"
  },
  {
    id: 'transport',
    title: 'Transport Emergency',
    icon: Bus,
    color: 'blue',
    description: 'Report bus breakdowns, accidents, or request emergency transit.',
    contacts: ['+1 (555) 777-0001'],
    location: 'Transport Depot'
  }
]

const StudentSOS = () => {
  const [activeModal, setActiveModal] = useState(null)
  const [alertSent, setAlertSent] = useState(false)

  const handleOpenModal = (category) => {
    setActiveModal(category)
    setAlertSent(false)
  }

  const handleSendAlert = () => {
    // In a real app, this would trigger an API call with location data
    setTimeout(() => {
      setAlertSent(true)
    }, 800)
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans pb-12">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-red-50 rounded-2xl mb-4 shadow-sm border border-red-100">
            <AlertOctagon className="text-red-600" size={40} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Campus SOS</h1>
          <p className="text-gray-500 font-medium mt-2 max-w-xl mx-auto">
            Emergency assistance is just a tap away. Select the appropriate category below to instantly access helplines or send a distress signal to campus authorities.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Quick Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SOS_CATEGORIES.map((cat) => {
            const Icon = cat.icon
            
            // Dynamic color mapping for Tailwind classes
            const colorClasses = {
              red: 'bg-red-50 border-red-200 text-red-600 hover:bg-red-600 hover:text-white shadow-red-600/20',
              orange: 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-600 hover:text-white shadow-orange-600/20',
              pink: 'bg-pink-50 border-pink-200 text-pink-600 hover:bg-pink-600 hover:text-white shadow-pink-600/20',
              purple: 'bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-600 hover:text-white shadow-purple-600/20',
              blue: 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white shadow-blue-600/20',
            }[cat.color]

            const iconBgClasses = {
              red: 'bg-red-100',
              orange: 'bg-orange-100',
              pink: 'bg-pink-100',
              purple: 'bg-purple-100',
              blue: 'bg-blue-100',
            }[cat.color]

            return (
              <button
                key={cat.id}
                onClick={() => handleOpenModal(cat)}
                className={`group flex flex-col items-center justify-center p-8 rounded-[24px] border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${colorClasses}`}
              >
                <div className={`p-5 rounded-2xl mb-4 transition-colors group-hover:bg-white/20 ${iconBgClasses}`}>
                  <Icon size={40} className="transition-colors" />
                </div>
                <h3 className="text-lg font-extrabold text-center mb-2 leading-tight">
                  {cat.title}
                </h3>
                <p className="text-sm font-medium text-center opacity-80 line-clamp-2">
                  {cat.description}
                </p>
              </button>
            )
          })}
        </div>

        {/* Global Emergency Info */}
        <div className="mt-12 bg-gray-900 rounded-[24px] p-8 shadow-2xl text-center border border-gray-800">
          <ShieldAlert className="text-yellow-400 mx-auto mb-4" size={32} />
          <h2 className="text-xl font-bold text-white mb-2">National Emergency Hotline</h2>
          <p className="text-gray-400 mb-6 text-sm">For severe emergencies outside campus jurisdiction, please dial the national emergency number.</p>
          <div className="inline-flex items-center gap-3 bg-white/10 px-6 py-3 rounded-xl border border-white/20">
            <Phone className="text-white" size={20} />
            <span className="text-2xl font-black text-white tracking-widest">911</span>
          </div>
        </div>

      </div>

      {/* Action Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl text-${activeModal.color}-600 bg-${activeModal.color}-50`}>
                  <activeModal.icon size={24} />
                </div>
                <h3 className="text-xl font-extrabold text-gray-900">{activeModal.title}</h3>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {!alertSent ? (
                <>
                  <p className="text-gray-600 font-medium mb-6">
                    {activeModal.description}
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    {activeModal.contacts.map((contact, idx) => (
                      <a 
                        key={idx}
                        href={`tel:${contact}`}
                        className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
                            <Phone className="text-gray-900" size={18} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Helpline {idx + 1}</p>
                            <p className="text-lg font-black text-gray-900">{contact}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-blue-600 group-hover:text-blue-700">Call</span>
                      </a>
                    ))}
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-blue-50 text-blue-900 rounded-xl border border-blue-100">
                    <MapPin className="text-blue-600 shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-0.5">Primary Location</p>
                      <p className="text-sm font-semibold">{activeModal.location}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full mb-6 shadow-sm border-4 border-green-50">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Alert Sent!</h3>
                  <p className="text-gray-600 font-medium">
                    Campus authorities have been notified of your location. Help is on the way. Please stay calm.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {!alertSent && (
              <div className="px-6 py-5 border-t border-gray-100 bg-gray-50">
                <button 
                  onClick={handleSendAlert}
                  className={`w-full py-4 text-white font-black text-lg rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2
                    ${activeModal.color === 'red' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : ''}
                    ${activeModal.color === 'orange' ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/20' : ''}
                    ${activeModal.color === 'pink' ? 'bg-pink-600 hover:bg-pink-700 shadow-pink-600/20' : ''}
                    ${activeModal.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20' : ''}
                    ${activeModal.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20' : ''}
                  `}
                >
                  <AlertOctagon size={24} />
                  Send Silent Alert
                </button>
                <p className="text-center text-xs text-gray-500 font-medium mt-3 flex items-center justify-center gap-1">
                  <Clock size={12} /> Shares your live location instantly
                </p>
              </div>
            )}
            {alertSent && (
              <div className="px-6 py-5 border-t border-gray-100 bg-gray-50">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Close Window
                </button>
              </div>
            )}
            
          </div>
        </div>
      )}

    </div>
  )
}

export default StudentSOS
