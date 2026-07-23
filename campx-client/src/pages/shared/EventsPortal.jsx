import React, { useState } from 'react';
import { Calendar, MapPin, Users, Ticket, CheckCircle2, QrCode, Plus, Download, Filter, Search, Award, BarChart3, Edit, Trash2, Terminal, Lightbulb, PenTool, BookOpen, Music } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const StudentEvents = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showQR, setShowQR] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleRegister = () => {
    toast.success('Successfully registered for Tech Symposium 2023!');
    setRegistered(true);
  };

  const categories = [
    { id: 'all', name: 'All Events', icon: Calendar, color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
    { id: 'hackathons', name: 'Hackathons', icon: Terminal, color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
    { id: 'quizzes', name: 'Quizzes', icon: Lightbulb, color: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' },
    { id: 'workshops', name: 'Workshops', icon: PenTool, color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
    { id: 'sabl', name: 'SABL Events', icon: BookOpen, color: 'bg-green-50 text-green-600 hover:bg-green-100' },
    { id: 'cultural', name: 'Cultural', icon: Music, color: 'bg-pink-50 text-pink-600 hover:bg-pink-100' },
  ];

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
        <div className="space-y-8 animate-fade-in">
          {/* Categories Section */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Browse by Category</h3>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
              {categories.map((cat) => {
                const isSelected = activeCategory === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex flex-col items-center justify-center min-w-[100px] h-24 rounded-2xl border transition-all duration-300 flex-shrink-0 ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50 shadow-sm scale-105' 
                        : 'border-transparent bg-white hover:border-gray-200 shadow-sm'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl mb-2 transition-colors ${isSelected ? 'bg-indigo-600 text-white' : cat.color}`}>
                      <Icon size={20} />
                    </div>
                    <span className={`text-xs font-bold ${isSelected ? 'text-indigo-900' : 'text-gray-600'}`}>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mock Event Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group">
              <div className="h-40 bg-gradient-to-br from-blue-600 to-indigo-800 p-6 flex flex-col justify-end relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                
                {/* Decorative circles */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-400/20 rounded-full blur-xl"></div>
                
                <div className="relative z-10">
                  <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] uppercase font-bold tracking-wider rounded-full mb-2 inline-block">Workshop</span>
                  <h3 className="text-xl font-bold text-white leading-tight">Advanced AI & ML Workshop</h3>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-2 text-sm text-gray-600 font-medium">
                  <div className="flex items-center gap-2"><Calendar size={16} className="text-indigo-500" /> Oct 25, 2023 • 10:00 AM</div>
                  <div className="flex items-center gap-2"><MapPin size={16} className="text-red-500" /> Seminar Hall A, CS Block</div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-green-500" /> 
                    <div className="flex-1 ml-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[80%] rounded-full"></div>
                    </div>
                    <span className="text-xs ml-2">120/150</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">Learn the basics of building generative AI applications using modern frameworks and APIs.</p>
                
                <button 
                  onClick={handleRegister}
                  disabled={registered}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${registered ? 'bg-green-50 text-green-700 cursor-default border border-green-200' : 'bg-gray-900 hover:bg-black text-white hover:shadow-md'}`}
                >
                  {registered ? 'Registered' : 'Register Now'}
                </button>
              </div>
            </div>
          </div>
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
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campus Events Hub</h1>
          <p className="text-gray-600 mt-1">Discover, register, and manage campus events and workshops.</p>
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
