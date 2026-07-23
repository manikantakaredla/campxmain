import React, { useState, useEffect } from 'react'
import {
  MapPin,
  Clock,
  Calendar,
  Settings,
  BellRing,
  Navigation,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'

// --- Mock Data Based on Timetable Image ---

const SUBJECTS_CONFIG = [
  {
    id: 'CN', name: 'Computer Networks',
    faculty: [
      { id: 'f1', name: 'Kavitapu N. Varaprasad', room: 'BB-504' },
      { id: 'f2', name: 'Koneti Durga Bhavani', room: 'BB-514' },
      { id: 'f3', name: 'Alla Devi Prasanthi', room: 'BB-515' },
    ]
  },
  {
    id: 'CD', name: 'Compiler Design',
    faculty: [
      { id: 'f4', name: 'Alla Devi Prasanthi', room: 'BB-504' },
      { id: 'f5', name: 'Dr. Jalaiah Saikam', room: 'BB-514' },
      { id: 'f6', name: 'Kavitapu N. Varaprasad', room: 'BB-515' },
    ]
  },
  {
    id: 'ML', name: 'Machine Learning',
    faculty: [
      { id: 'f7', name: 'M Kalyan Ram', room: 'BB-504' },
      { id: 'f8', name: 'Jyothula Vidya', room: 'BB-514' },
      { id: 'f9', name: 'Dr. Subba Rao Polamuri', room: 'BB-515' },
    ]
  },
  {
    id: 'OOAD', name: 'OOAD / OOAD LAB',
    faculty: [
      { id: 'f10', name: 'M. V. Ajay Kumar Reddy', room: 'BB-504' },
      { id: 'f11', name: 'Ramesh Kothapalli', room: 'BB-514' },
      { id: 'f12', name: 'Rananki Padma Sri', room: 'BB-515' },
    ]
  },
  {
    id: 'EEM', name: 'Engg Economics & Mgmt',
    faculty: [
      { id: 'f13', name: 'Dr. N. Visalakshi', room: 'BB-504' },
      { id: 'f14', name: 'Dr. Elumalai P V', room: 'BB-514' },
      { id: 'f15', name: 'Mr. V Suneetha', room: 'BB-515' },
    ]
  },
  {
    id: 'IRSA', name: 'Info Retrieval Systems',
    faculty: [
      { id: 'f16', name: 'M Kalyan Ram', room: 'BB-504' },
      { id: 'f17', name: 'Dr. Pennada S. S. Prasad', room: 'BB-514' },
      { id: 'f18', name: 'G Uma Mahesh', room: 'BB-515' },
    ]
  },
  {
    id: 'FDS', name: 'Fund. of Data Science',
    faculty: [
      { id: 'f19', name: 'U P Kumar Chaturvedula', room: 'BB-504' },
      { id: 'f20', name: 'Dr. Appalaraju Grandhi', room: 'BB-514' },
      { id: 'f21', name: 'R Padma Sri', room: 'BB-515' },
    ]
  }
]

const FIXED_SUBJECTS = {
  'SS': { room: 'JWB 307' },
  'APT': { room: 'BGB 102' },
  'Coursera': { room: 'Online' },
  'Lunch': { room: 'Cafeteria' },
  'FIP': { room: 'Seminar Hall' }
}

const TIMESLOTS = [
  { id: 't1', time: '9:30 - 10:20' },
  { id: 't2', time: '10:20 - 11:10' },
  { id: 't3', time: '11:20 - 12:10' },
  { id: 't4', time: '12:10 - 1:00' },
  { id: 't5', time: '1:00 - 1:50', isBreak: true }, // Lunch
  { id: 't6', time: '1:50 - 2:40' },
  { id: 't7', time: '2:50 - 3:40' },
  { id: 't8', time: '3:40 - 4:20' }
]

const SCHEDULE_GRID = {
  'Mon': ['SS', 'SS', 'SS', 'Coursera', 'Lunch', 'CD', 'IRSA', 'FIP'],
  'Tue': ['OOAD', 'OOAD', 'ML', 'CD', 'Lunch', 'FDS', 'IRSA', ''],
  'Wed': ['EEM', 'ML', 'FDS', 'FDS', 'Lunch', 'APT', 'APT', 'APT'],
  'Thu': ['IRSA', 'IRSA', 'ML', 'CN', 'Lunch', 'CD', 'ML', 'EEM'],
  'Fri': ['CD', 'FDS', 'OOAD', 'OOAD', 'Lunch', 'ML', 'ML', 'Coursera'],
  'Sat': ['ACTIVITY DAY']
}

// --- Component ---

const StudentTimetable = () => {
  // State for selected faculty per subject ID
  const [selections, setSelections] = useState(() => {
    // Default to first faculty member for each subject
    const initial = {}
    SUBJECTS_CONFIG.forEach(sub => {
      initial[sub.id] = sub.faculty[0].id
    })
    return initial
  })

  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  
  // Simulate an upcoming class (e.g. Wed 11:20 ML class)
  const upcomingClassSub = 'ML'
  const upcomingFacultyId = selections[upcomingClassSub]
  const upcomingFacultyObj = SUBJECTS_CONFIG.find(s => s.id === upcomingClassSub).faculty.find(f => f.id === upcomingFacultyId)
  
  useEffect(() => {
    // Simulate receiving a 5-min before notification after 3 seconds
    const timer = setTimeout(() => {
      setShowNotification(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [selections])

  const handleSelectionChange = (subjectId, facultyId) => {
    setSelections(prev => ({
      ...prev,
      [subjectId]: facultyId
    }))
  }

  // Helper to get room for a specific subject based on selection
  const getRoomForSubject = (subCode) => {
    if (!subCode) return ''
    if (FIXED_SUBJECTS[subCode]) return FIXED_SUBJECTS[subCode].room
    
    // It's a choice-based subject
    const subConfig = SUBJECTS_CONFIG.find(s => s.id === subCode)
    if (!subConfig) return ''
    const selectedFacId = selections[subCode]
    const facObj = subConfig.faculty.find(f => f.id === selectedFacId)
    return facObj ? facObj.room : ''
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans pb-12 relative overflow-hidden">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                <MapPin className="text-indigo-600" size={28} />
                Smart Classroom Finder
              </h1>
              <p className="text-gray-500 font-medium mt-1">
                Your dynamically generated timetable based on faculty choices.
              </p>
            </div>
            <div>
              <button 
                onClick={() => setIsConfigOpen(!isConfigOpen)}
                className="px-5 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold rounded-xl transition-colors border border-indigo-100 flex items-center gap-2"
              >
                <Settings size={18} />
                Configure Faculty
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Next Class Live Widget */}
        <div className="mb-8 bg-gradient-to-r from-gray-900 to-indigo-900 rounded-[24px] p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between border border-gray-800">
          <div className="flex items-center gap-5 w-full md:w-auto">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
              <Navigation className="text-indigo-400" size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <p className="text-sm font-bold text-indigo-200 uppercase tracking-wider">Live Next Class</p>
              </div>
              <h2 className="text-2xl font-black text-white">Machine Learning</h2>
              <p className="text-indigo-100 font-medium opacity-90 mt-1">
                {upcomingFacultyObj?.name}
              </p>
            </div>
          </div>
          
          <div className="mt-6 md:mt-0 bg-black/30 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/10 text-center w-full md:w-auto">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Venue</p>
            <p className="text-4xl font-black text-green-400 tracking-tight">{upcomingFacultyObj?.room}</p>
          </div>
        </div>

        {/* Dynamic Timetable Grid (Desktop) */}
        <div className="hidden md:block bg-white rounded-[24px] shadow-sm border border-gray-200 overflow-x-auto">
          <div className="min-w-[1000px] p-6">
            <div className="grid grid-cols-[100px_repeat(8,1fr)] gap-2 mb-4">
              <div className="flex items-center justify-center font-black text-gray-400 uppercase text-xs tracking-wider">Day \ Time</div>
              {TIMESLOTS.map(slot => (
                <div key={slot.id} className="bg-gray-50 rounded-xl py-3 px-2 text-center border border-gray-100">
                  <p className="text-xs font-bold text-gray-900 whitespace-nowrap">{slot.time}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {Object.entries(SCHEDULE_GRID).map(([day, classes]) => (
                <div key={day} className="grid grid-cols-[100px_repeat(8,1fr)] gap-2">
                  <div className="bg-indigo-50 text-indigo-800 rounded-xl flex items-center justify-center font-black text-sm uppercase tracking-wider border border-indigo-100">
                    {day}
                  </div>
                  
                  {day === 'Sat' ? (
                    <div className="col-span-8 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center font-black text-sm uppercase tracking-widest border border-pink-100 py-4">
                      Activity Day
                    </div>
                  ) : (
                    classes.map((sub, idx) => {
                      if (sub === 'Lunch') {
                        return (
                          <div key={idx} className="bg-gray-100 text-gray-500 rounded-xl flex items-center justify-center font-bold text-xs border border-gray-200">
                            Lunch
                          </div>
                        )
                      }
                      if (!sub) {
                        return <div key={idx} className="bg-gray-50 rounded-xl border border-dashed border-gray-200"></div>
                      }
                      
                      const room = getRoomForSubject(sub)
                      const isSpecial = ['SS', 'APT'].includes(sub)
                      
                      return (
                        <div key={idx} className={`rounded-xl flex flex-col items-center justify-center p-2 text-center border transition-all hover:shadow-md hover:-translate-y-0.5 ${
                          isSpecial ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200 hover:border-indigo-300'
                        }`}>
                          <p className={`font-black text-sm ${isSpecial ? 'text-yellow-800' : 'text-gray-900'}`}>{sub}</p>
                          <p className={`text-[10px] font-bold mt-1 px-2 py-0.5 rounded text-white ${isSpecial ? 'bg-yellow-600' : 'bg-indigo-600'}`}>
                            {room}
                          </p>
                        </div>
                      )
                    })
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Timetable (Mobile) */}
        <div className="md:hidden space-y-4">
          {Object.entries(SCHEDULE_GRID).map(([day, classes]) => (
            <div key={day} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 text-base mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
                <Calendar size={18} className="text-indigo-600" />
                {day}
              </h3>
              {day === 'Sat' ? (
                 <div className="bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center font-black text-sm uppercase tracking-widest border border-pink-100 py-4">
                   Activity Day
                 </div>
              ) : (
                <div className="space-y-2">
                  {classes.map((sub, idx) => {
                    if (!sub) return null;
                    const slot = TIMESLOTS[idx];
                    
                    if (sub === 'Lunch') {
                      return (
                        <div key={idx} className="bg-gray-50 flex items-center justify-between p-3 rounded-xl border border-gray-100">
                          <span className="text-gray-500 font-bold text-sm">Lunch Break</span>
                          <span className="text-xs font-semibold text-gray-400">{slot.time}</span>
                        </div>
                      )
                    }
                    
                    const room = getRoomForSubject(sub)
                    const isSpecial = ['SS', 'APT'].includes(sub)

                    return (
                      <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${isSpecial ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-100'}`}>
                        <div>
                          <p className={`font-black text-sm ${isSpecial ? 'text-yellow-800' : 'text-gray-900'}`}>{sub}</p>
                          <p className="text-xs font-medium text-gray-500 mt-0.5 flex items-center gap-1">
                            <Clock size={12} /> {slot.time}
                          </p>
                        </div>
                        <p className={`text-[10px] font-bold px-2 py-1 rounded-md text-white ${isSpecial ? 'bg-yellow-600' : 'bg-indigo-600'}`}>
                          {room}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>

      {/* Choice Setup Drawer */}
      {isConfigOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-gray-900/20 backdrop-blur-sm" onClick={() => setIsConfigOpen(false)}></div>
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 border-l border-gray-200">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">Faculty Configuration</h3>
                <p className="text-xs font-semibold text-gray-500">Select your faculty to update room locations</p>
              </div>
              <button onClick={() => setIsConfigOpen(false)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors">
                <Settings size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {SUBJECTS_CONFIG.map(sub => (
                <div key={sub.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:border-indigo-300 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-xs">
                        {sub.id}
                      </span>
                      {sub.name}
                    </h4>
                  </div>
                  <div className="space-y-2 mt-2">
                    {sub.faculty.map(fac => {
                      const isSelected = selections[sub.id] === fac.id
                      return (
                        <div 
                          key={fac.id}
                          onClick={() => handleSelectionChange(sub.id, fac.id)}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected 
                            ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                            : 'bg-white border-gray-100 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                            }`}>
                              {isSelected && <CheckCircle2 size={12} className="text-white" />}
                            </div>
                            <span className={`font-semibold text-sm ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                              {fac.name}
                            </span>
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${
                            isSelected ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {fac.room}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <button 
                onClick={() => setIsConfigOpen(false)}
                className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors shadow-lg"
              >
                Save & Update Timetable
              </button>
            </div>
          </div>
        </>
      )}

      {/* 5-Min Notification Simulator Overlay */}
      {showNotification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-bounce-short">
          <div className="bg-white border-2 border-indigo-500 rounded-[20px] p-1 shadow-2xl flex items-center pr-6 overflow-hidden">
            <div className="bg-indigo-500 text-white p-4 flex items-center justify-center rounded-l-[16px]">
              <BellRing size={24} className="animate-pulse" />
            </div>
            <div className="pl-4 py-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                <Clock size={12} /> Class in 5 Mins
              </p>
              <p className="text-base font-black text-gray-900">
                Venue for <span className="text-indigo-600">{upcomingClassSub}</span> is in <span className="text-green-600 text-xl">{upcomingFacultyObj?.room}</span>
              </p>
            </div>
            <button onClick={() => setShowNotification(false)} className="ml-6 text-gray-400 hover:text-gray-900 bg-gray-100 p-1.5 rounded-full">
              <AlertTriangle size={16} className="opacity-0" /> {/* Spacer */}
              <span className="absolute right-4 top-1/2 -translate-y-1/2">×</span>
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default StudentTimetable
