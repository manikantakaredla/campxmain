import React, { useState } from 'react';
import { Calendar, MapPin, Users, Ticket, CheckCircle2, QrCode, Plus, Download, Filter, Search, Award, BarChart3, Edit, Trash2, Terminal, Lightbulb, PenTool, BookOpen, Music, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const StudentEvents = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeView, setActiveView] = useState('categories');
  const [showQR, setShowQR] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleRegister = () => {
    toast.success('Successfully registered for Tech Symposium 2023!');
    setRegistered(true);
  };

  const categories = [
    { id: 'all', name: 'All Events', icon: Calendar, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-100 hover:border-blue-300' },
    { id: 'hackathons', name: 'Hackathons', icon: Terminal, color: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-100 hover:border-indigo-300' },
    { id: 'quizzes', name: 'Quizzes', icon: Lightbulb, color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-100 hover:border-yellow-300' },
    { id: 'workshops', name: 'Workshops', icon: PenTool, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-100 hover:border-purple-300' },
    { id: 'sabl', name: 'SABL Events', icon: BookOpen, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-100 hover:border-green-300' },
    { id: 'cultural', name: 'Cultural', icon: Music, color: 'text-pink-600', bgColor: 'bg-pink-50', borderColor: 'border-pink-100 hover:border-pink-300' },
  ];

  const handleCategoryClick = (catId) => {
    setActiveCategory(catId);
    setActiveView('events');
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto hide-scrollbar">
        {['upcoming', 'registered', 'history', 'certificates'].map((tab) => (
          <button 
            key={tab}
            className={`py-3 px-5 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'upcoming' && (
        <div className="space-y-6 animate-fade-in">
          {activeView === 'categories' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${cat.borderColor} ${cat.bgColor} transition-all duration-300 hover:shadow-lg group text-center cursor-pointer h-full`}
                  >
                    <div className="scale-75 md:scale-100">
                      <Icon className={`w-6 h-6 mb-3 ${cat.color} group-hover:scale-110 transition-transform`} />
                    </div>
                    <h3 className="font-bold text-gray-800 text-[10px] md:text-xs group-hover:text-blue-700 transition-colors uppercase tracking-wider">{cat.name}</h3>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => setActiveView('categories')}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm font-medium border border-gray-200 bg-white"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Categories
                </button>
                <h2 className="text-xl font-bold text-gray-800">
                  {categories.find(c => c.id === activeCategory)?.name || 'Events'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Luma-style Event Card */}
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col h-full relative">
              
              {/* Image Section */}
              <div className="h-48 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                <img 
                  src="https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&auto=format&fit=crop&q=60" 
                  alt="Workshop" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Top Tags */}
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-gray-900 text-xs font-bold rounded-full shadow-sm">
                    Workshop
                  </span>
                  <span className="px-3 py-1 bg-indigo-600/90 backdrop-blur-md text-white text-xs font-bold rounded-full shadow-sm flex items-center gap-1">
                    <Ticket size={12} /> Free
                  </span>
                </div>

                {/* Date Badge Overlay */}
                <div className="absolute bottom-4 left-4 z-20">
                  <h3 className="text-xl font-bold text-white leading-tight mb-1">Advanced AI & ML Workshop</h3>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Date & Time</span>
                    <span className="font-medium text-gray-900 mt-0.5">Oct 25, 2023 • 10:00 AM</span>
                  </div>
                  <div className="w-px h-8 bg-gray-100"></div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Location</span>
                    <span className="font-medium text-gray-900 mt-0.5">Seminar Hall A</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-6">Learn the basics of building generative AI applications using modern frameworks and APIs. Perfect for beginners and intermediate developers.</p>
                
                <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-4">
                  {/* Attendees Avatars */}
                  <div className="flex items-center">
                    <div className="flex -space-x-2">
                      <img className="w-8 h-8 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=1" alt="Attendee" />
                      <img className="w-8 h-8 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=2" alt="Attendee" />
                      <img className="w-8 h-8 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=3" alt="Attendee" />
                    </div>
                    <span className="text-xs font-medium text-gray-500 ml-3">+117 attending</span>
                  </div>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRegister(); }}
                    disabled={registered}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${registered ? 'bg-green-50 text-green-700 cursor-default border border-green-200' : 'bg-gray-900 hover:bg-black text-white hover:shadow-md'}`}
                  >
                    {registered ? 'Joined' : 'Join'}
                  </button>
                </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      )}

      {activeTab === 'registered' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex flex-col items-center justify-center text-blue-600 flex-shrink-0">
                <span className="text-xs font-bold uppercase">Oct</span>
                <span className="text-xl font-black leading-none">25</span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">Advanced AI & ML Workshop</h4>
                <p className="text-sm text-gray-500 flex items-center gap-2"><MapPin size={14} /> Seminar Hall A • 10:00 AM</p>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={() => setShowQR(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
              >
                <QrCode size={16} /> Show Pass
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showQR && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowQR(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center space-y-4 animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900">Digital Event Pass</h3>
            <p className="text-sm text-gray-500">Scan this code at the venue entry.</p>
            <div className="bg-gray-100 p-4 rounded-xl flex items-center justify-center">
              {/* Dummy QR representation */}
              <div className="w-48 h-48 bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=CAMPX-EVENT-PASS-12345')] bg-contain bg-center bg-no-repeat"></div>
            </div>
            <p className="text-xs font-mono bg-gray-50 py-1.5 rounded text-gray-600">ID: EVT-8924-A7B2</p>
            <button 
              onClick={() => setShowQR(false)}
              className="w-full py-2.5 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <Award size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Past Events</h3>
          <p className="text-sm text-gray-500">You haven't attended any events yet.</p>
        </div>
      )}

      {activeTab === 'certificates' && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <Download size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Certificates Available</h3>
          <p className="text-sm text-gray-500">Attend events to earn certificates.</p>
        </div>
      )}
    </div>
  );
};

const CoordinatorEvents = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Events</p>
              <h4 className="text-2xl font-bold text-gray-900 mt-1">12</h4>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={20} /></div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Registrations</p>
              <h4 className="text-2xl font-bold text-gray-900 mt-1">845</h4>
            </div>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Users size={20} /></div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Average Turnout</p>
              <h4 className="text-2xl font-bold text-gray-900 mt-1">88%</h4>
            </div>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><BarChart3 size={20} /></div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-center">
           <button className="flex items-center gap-2 text-blue-600 font-medium hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors w-full justify-center">
             <Plus size={20} /> Create Event
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-lg text-gray-800">My Hosted Events</h3>
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input type="text" placeholder="Search events..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                <th className="px-6 py-4 font-medium">Event Name</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Registrations</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">Advanced AI & ML Workshop</td>
                <td className="px-6 py-4 text-sm text-gray-600">Oct 25, 2023</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full w-[80%]"></div>
                    </div>
                    <span className="text-xs font-medium text-gray-600">120/150</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Upcoming</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="Manage Registrations">
                      <Users size={16} />
                    </button>
                    <button className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded" title="Edit">
                      <Edit size={16} />
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">Annual Tech Hackathon</td>
                <td className="px-6 py-4 text-sm text-gray-600">Sep 15, 2023</td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-600">300 Attended</span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Completed</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded" title="Generate Certificates">
                      <Award size={16} />
                    </button>
                    <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="View Analytics">
                      <BarChart3 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const EventsPortal = () => {
  const { user } = useAuth();
  
  return (
    <div className="px-4 py-6 max-w-7xl mx-auto animate-fade-in bg-[#f8f9fa] min-h-screen">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-900">Campus Events Hub</h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">Discover, register, and manage campus events and workshops.</p>
        </div>
        {user?.role !== 'student' && (
          <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
            <QrCode size={16} /> Scan QR Entry
          </button>
        )}
      </div>

      {user?.role === 'student' ? <StudentEvents /> : <CoordinatorEvents />}
    </div>
  );
};

export default EventsPortal;
