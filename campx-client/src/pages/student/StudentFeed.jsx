import React, { useState } from 'react'
import {
  Sparkles,
  Search,
  Settings,
  MapPin,
  Calendar,
  Clock,
  Bookmark,
  ChevronRight,
  TrendingUp,
  Target,
  Trophy,
  Users
} from 'lucide-react'

// Mock Data
const ALL_INTERESTS = [
  'Artificial Intelligence', 'Web Development', 'IoT', 'Robotics',
  'Competitive Programming', 'Mechanical', 'Electronics', 'Entrepreneurship',
  'Sports', 'UI/UX', 'Cybersecurity', 'Data Science'
]

const MOCK_FEED = [
  {
    id: 1,
    org: 'Google Developer Groups',
    logo: 'G',
    title: 'GDG AI Hackathon 2026',
    description: 'Join the biggest AI hackathon on campus. Build innovative solutions using Gemini and generative AI technologies. Prizes worth $5000!',
    tags: ['Hackathon', 'Artificial Intelligence', 'Coding'],
    date: 'Oct 15 - Oct 17',
    deadline: 'Oct 10',
    location: 'Offline - Main Auditorium',
    matchScore: 98,
    matchReason: "Recommended because you're interested in AI and Hackathons.",
  },
  {
    id: 2,
    org: 'Microsoft Learn',
    logo: 'M',
    title: 'Azure Cloud & Web Workshop',
    description: 'Learn how to deploy scalable full-stack web applications on Microsoft Azure. Hands-on workshop with industry experts.',
    tags: ['Workshop', 'Web Development'],
    date: 'Oct 20, 2:00 PM',
    deadline: 'Oct 18',
    location: 'Online',
    matchScore: 92,
    matchReason: "Recommended because you're interested in Web Development.",
  },
  {
    id: 3,
    org: 'Design Hub',
    logo: 'D',
    title: 'UI/UX Design Sprint',
    description: 'A 24-hour design sprint focused on solving real-world accessibility challenges in modern university apps.',
    tags: ['Competition', 'UI/UX'],
    date: 'Oct 25',
    deadline: 'Oct 22',
    location: 'Offline - Design Lab',
    matchScore: 85,
    matchReason: "Recommended because you're interested in UI/UX.",
  },
  {
    id: 4,
    org: 'Sports Committee',
    logo: 'S',
    title: 'Inter-Department Cricket Tournament',
    description: 'Annual cricket tournament registrations are open. Form a team of 11 from your department and compete for the campus cup.',
    tags: ['Sports', 'Tournament'],
    date: 'Nov 1 - Nov 10',
    deadline: 'Oct 28',
    location: 'Offline - Main Ground',
    matchScore: 78,
    matchReason: "Recommended because you're interested in Sports.",
  }
]

const MOCK_TRENDING = [
  { id: 1, title: 'Smart India Hackathon Registrations', type: 'Hackathon' },
  { id: 2, title: 'Google Summer of Code Info Session', type: 'Event' },
  { id: 3, title: 'AWS Cloud Practitioner Certification', type: 'Course' },
]

const MOCK_DEADLINES = [
  { id: 1, title: 'GDG AI Hackathon Registration', date: 'Tomorrow, 11:59 PM' },
  { id: 2, title: 'Summer Internship Resume Submission', date: 'In 3 days' },
]

const StudentFeed = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('For You')
  const [selectedInterests, setSelectedInterests] = useState([
    'Artificial Intelligence', 'Web Development', 'UI/UX', 'Sports'
  ])
  const [isEditingInterests, setIsEditingInterests] = useState(false)

  const filters = [
    'For You', 'Latest', 'Hackathons', 'Internships', 
    'Workshops', 'Competitions', 'Sports', 'Clubs', 'Research'
  ]

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest))
    } else {
      setSelectedInterests([...selectedInterests, interest])
    }
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Top Header Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Sparkles className="text-blue-600" size={18} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-gray-900">My Feed</h1>
            </div>
          </div>
          <p className="text-xs text-gray-500 font-medium ml-9">Opportunities and updates tailored for you.</p>
          
          <div className="mt-4 flex flex-col md:flex-row gap-3 items-center">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search events, clubs..." 
                className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex-1 w-full overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-2 min-w-max">
                {filters.map(filter => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                      activeFilter === filter 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Feed Area */}
          <div className="lg:col-span-2 space-y-5">
            
            {/* Interests Section */}
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <Target size={16} className="text-blue-500" />
                  Your Interests
                </h2>
                <button 
                  onClick={() => setIsEditingInterests(!isEditingInterests)}
                  className="text-[10px] md:text-xs text-blue-600 font-bold hover:text-blue-700 flex items-center gap-1"
                >
                  <Settings size={12} />
                  {isEditingInterests ? 'Done Editing' : 'Edit'}
                </button>
              </div>
              
              {selectedInterests.length === 0 && !isEditingInterests ? (
                <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <p className="text-[10px] md:text-xs text-gray-500 mb-2 font-medium">Choose your interests to receive personalized recommendations.</p>
                  <button 
                    onClick={() => setIsEditingInterests(true)}
                    className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-[10px] md:text-xs font-bold shadow-sm hover:bg-gray-50 text-gray-700"
                  >
                    Select Interests
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {(isEditingInterests ? ALL_INTERESTS : selectedInterests).map(interest => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        onClick={() => isEditingInterests && toggleInterest(interest)}
                        className={`px-2.5 py-1 rounded-md text-[10px] md:text-xs font-bold transition-colors ${
                          isSelected 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'bg-gray-50 text-gray-600 border border-transparent hover:bg-gray-100'
                        } ${!isEditingInterests && 'cursor-default'}`}
                      >
                        {interest} {isEditingInterests && (isSelected ? '×' : '+')}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Feed Cards List */}
            <div className="space-y-4">
              {MOCK_FEED.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-2xl p-4 md:p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center border border-blue-100 shrink-0 shadow-sm">
                        <span className="text-base font-black text-blue-600">{item.logo}</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-1">{item.title}</h3>
                        <p className="text-[10px] md:text-xs text-gray-500 font-bold mt-0.5">{item.org}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded flex-shrink-0">
                      <Sparkles size={10} />
                      <span className="text-[10px] font-black">{item.matchScore}%</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-500 text-[11px] md:text-xs mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3 text-[10px] md:text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Calendar size={12} className="text-gray-400" />
                      <span className="font-semibold text-gray-800">{item.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Clock size={12} className="text-red-400" />
                      <span className="font-semibold text-red-600">{item.deadline}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600 w-full sm:w-auto">
                      <MapPin size={12} className="text-gray-400" />
                      <span className="font-semibold text-gray-800 line-clamp-1">{item.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {item.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] md:text-[10px] font-bold uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-xl transition-colors">
                      Register
                    </button>
                    <button className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-bold py-2 px-3 rounded-xl transition-colors text-center">
                      Details
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-gray-200">
                      <Bookmark size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Widgets Area */}
          <div className="space-y-5">
            
            {/* Trending Widget */}
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                <TrendingUp className="text-blue-500" size={16} />
                Trending on Campus
              </h3>
              <div className="space-y-3">
                {MOCK_TRENDING.map((item, i) => (
                  <div key={item.id} className="flex gap-2 group cursor-pointer items-start">
                    <span className="text-gray-200 font-black text-lg leading-none mt-0.5">0{i + 1}</span>
                    <div>
                      <p className="font-bold text-xs text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                        {item.title}
                      </p>
                      <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">{item.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                <Clock className="text-red-500" size={16} />
                Deadlines
              </h3>
              <div className="space-y-3">
                {MOCK_DEADLINES.map((item) => (
                  <div key={item.id} className="border-l-2 border-red-400 pl-2.5">
                    <p className="font-bold text-gray-800 text-xs leading-tight mb-0.5">{item.title}</p>
                    <p className="text-[10px] font-bold text-red-500">{item.date}</p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-1.5 text-[10px] md:text-xs text-gray-500 hover:text-gray-900 font-bold border-t border-gray-100 pt-3 flex items-center justify-center gap-1 transition-colors">
                View All <ChevronRight size={12} />
              </button>
            </div>

            {/* Weekly Goal */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-4 md:p-5 text-white shadow-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  <Trophy size={16} className="text-yellow-300" />
                  Weekly Goal
                </h3>
              </div>
              <p className="text-blue-100 text-[10px] md:text-xs mb-4 font-medium leading-relaxed">Participate in 2 events to keep your streak alive!</p>
              
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-[10px] font-bold">
                  <span>Progress</span>
                  <span>1/2</span>
                </div>
                <div className="h-2 bg-blue-900/40 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 w-1/2 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
                </div>
              </div>
              <button className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-xl transition-colors text-xs backdrop-blur-sm">
                Explore Events
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default StudentFeed
