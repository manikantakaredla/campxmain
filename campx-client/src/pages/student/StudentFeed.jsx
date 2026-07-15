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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Sparkles className="text-blue-600" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">My Feed</h1>
              <p className="text-gray-500 font-medium mt-1">Opportunities and updates tailored for you.</p>
            </div>
          </div>
          
          <div className="mt-6 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search opportunities, clubs, events..." 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white text-gray-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex-1 w-full overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex gap-2 min-w-max">
                {filters.map(filter => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm ${
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Feed Area (takes 2 columns on large screens) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Interests Section */}
            <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100/50">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Target size={20} className="text-blue-500" />
                  Your Interests
                </h2>
                <button 
                  onClick={() => setIsEditingInterests(!isEditingInterests)}
                  className="text-sm text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1"
                >
                  <Settings size={16} />
                  {isEditingInterests ? 'Done Editing' : 'Edit Interests'}
                </button>
              </div>
              
              {selectedInterests.length === 0 && !isEditingInterests ? (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500 mb-3 font-medium">Choose your interests to receive personalized recommendations.</p>
                  <button 
                    onClick={() => setIsEditingInterests(true)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold shadow-sm hover:bg-gray-50 text-gray-700"
                  >
                    Select Interests
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(isEditingInterests ? ALL_INTERESTS : selectedInterests).map(interest => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        onClick={() => isEditingInterests && toggleInterest(interest)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          isSelected 
                            ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                            : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200'
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
            <div className="space-y-6">
              {MOCK_FEED.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-[20px] p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center border border-blue-100 shrink-0">
                        <span className="text-lg font-bold text-blue-600">{item.logo}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">{item.title}</h3>
                        <p className="text-sm text-gray-500 font-medium mt-0.5">{item.org}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-green-100 shrink-0">
                      <Sparkles size={12} />
                      {item.matchScore}% Match
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {item.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-4 text-sm bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} className="text-gray-400 shrink-0" />
                      <span className="font-medium text-gray-800">{item.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={16} className="text-red-400 shrink-0" />
                      <span>Deadline: <span className="font-medium text-red-600">{item.deadline}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 col-span-2">
                      <MapPin size={16} className="text-gray-400 shrink-0" />
                      <span className="font-medium text-gray-800">{item.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-5">
                    {item.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-5 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50 text-sm">
                    <Sparkles size={16} className="text-blue-500 shrink-0" />
                    <span className="text-gray-700 font-medium">{item.matchReason}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors duration-200">
                      Register Now
                    </button>
                    <button className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-semibold py-2.5 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2">
                      View Details
                    </button>
                    <button className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-gray-200">
                      <Bookmark size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Widgets Area */}
          <div className="space-y-6">
            
            {/* Trending Widget */}
            <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100/50">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="text-blue-500" size={20} />
                Trending on Campus
              </h3>
              <div className="space-y-4">
                {MOCK_TRENDING.map((item, i) => (
                  <div key={item.id} className="flex gap-3 group cursor-pointer">
                    <span className="text-gray-300 font-bold text-xl leading-none mt-0.5">0{i + 1}</span>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                        {item.title}
                      </p>
                      <p className="text-xs font-medium text-gray-500 mt-1">{item.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100/50">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="text-red-500" size={20} />
                Upcoming Deadlines
              </h3>
              <div className="space-y-4">
                {MOCK_DEADLINES.map((item) => (
                  <div key={item.id} className="border-l-[3px] border-red-400 pl-3">
                    <p className="font-semibold text-gray-900 text-sm leading-tight mb-1">{item.title}</p>
                    <p className="text-xs font-bold text-red-500">{item.date}</p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-5 py-2 text-sm text-gray-600 hover:text-gray-900 font-bold border-t border-gray-100 pt-4 flex items-center justify-center gap-1 transition-colors">
                View All <ChevronRight size={16} />
              </button>
            </div>

            {/* Weekly Goal */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[20px] p-6 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)]">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Trophy size={20} className="text-yellow-300" />
                  Weekly Goal
                </h3>
              </div>
              <p className="text-blue-100 text-sm mb-5 font-medium leading-relaxed">Participate in 2 events this week to keep your learning streak alive!</p>
              
              <div className="space-y-2 mb-5">
                <div className="flex justify-between text-sm font-bold">
                  <span>Progress</span>
                  <span>1/2</span>
                </div>
                <div className="h-2.5 bg-blue-900/40 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 w-1/2 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
                </div>
              </div>
              <button className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 rounded-xl transition-colors text-sm backdrop-blur-sm">
                Explore Events
              </button>
            </div>

            {/* Recommended Clubs */}
            <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100/50">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="text-indigo-500" size={20} />
                Recommended Clubs
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold shrink-0 group-hover:scale-105 transition-transform">
                      RC
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900 leading-tight">Robotics Club</p>
                      <p className="text-xs font-medium text-gray-500 mt-0.5">120 Members</p>
                    </div>
                  </div>
                  <button className="text-sm font-bold text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                    Join
                  </button>
                </div>
                <div className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 font-bold shrink-0 group-hover:scale-105 transition-transform">
                      CC
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900 leading-tight">Coding Club</p>
                      <p className="text-xs font-medium text-gray-500 mt-0.5">350 Members</p>
                    </div>
                  </div>
                  <button className="text-sm font-bold text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                    Join
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default StudentFeed
