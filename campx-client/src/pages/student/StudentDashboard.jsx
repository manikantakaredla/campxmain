import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { announcementService } from '../../services/announcementService';
import { calendarService } from '../../services/calendarService';
import { notificationService } from '../../services/notificationService';
import { useSettings } from '../../hooks/useSettings';
import api from '../../api/axios';
import { 
  Bell, 
  Megaphone, 
  Calendar, 
  ChevronRight,
  Clock,
  ArrowRight,
  Briefcase,
  UserCheck,
  CreditCard,
  Grid,
  MapPin,
  Bookmark
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { settings } = useSettings();
  
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [activeBanner, setActiveBanner] = useState(0);

  // Mock data for timetable
  const todaySchedule = [
    { time: '09:00 AM', subject: 'Data Structures', class: 'CSE - 3A', room: 'Room 201', color: 'blue' },
    { time: '11:00 AM', subject: 'Operating Systems', class: 'CSE - 3A', room: 'Room 203', color: 'green' },
    { time: '02:00 PM', subject: 'Database Management', class: 'CSE - 3A', room: 'Room 205', color: 'orange' },
  ];

  useEffect(() => {
    fetchAnnouncements();
    fetchEvents();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await announcementService.getAll({ page: 1, limit: 3 });
      setRecentAnnouncements(res.announcements || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const upcomingRes = await calendarService.getUpcoming();
      setUpcomingEvents(upcomingRes.activities?.slice(0, 3) || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const banners = settings?.homeBanners?.filter(b => b.isActive) || [];

  // Fallback banner if none are configured by admin
  const displayBanners = banners.length > 0 ? banners : [
    {
      id: 'fallback1',
      tag: 'Upcoming Event',
      title: 'AI/ML Workshop',
      date: '15 May 2025',
      time: '10:00 AM',
      location: 'Seminar Hall, Block A',
      image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop',
      link: '/student/events'
    }
  ];

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header section matching mockup exactly */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Good Morning, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Have a productive day at CAMPX!</p>
          </div>
          <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl text-center shadow-sm border border-blue-100">
            <div className="text-[10px] font-bold uppercase tracking-wider">{new Date().toLocaleString('default', { weekday: 'long' })}</div>
            <div className="text-sm font-black">{new Date().getDate()} {new Date().toLocaleString('default', { month: 'short' })}</div>
          </div>
        </div>

        {/* Carousel Section */}
        <div className="mb-8 relative w-full overflow-hidden rounded-3xl aspect-[1.8/1] sm:aspect-[2.5/1] md:aspect-[3/1] bg-gradient-to-r from-[#1E2B6D] to-[#3B4FA3] text-white shadow-lg">
          <div className="absolute inset-0 flex snap-x snap-mandatory overflow-x-auto [&::-webkit-scrollbar]:hidden scroll-smooth" onScroll={(e) => {
            const index = Math.round(e.target.scrollLeft / e.target.clientWidth);
            setActiveBanner(index);
          }}>
            {displayBanners.map((banner, index) => (
              <div key={banner.id} className="min-w-full snap-center relative p-6 md:p-8 flex items-center">
                {banner.image && (
                  <div className="absolute right-0 bottom-0 h-full w-1/2 opacity-30 md:opacity-50">
                    <img src={banner.image} alt={banner.title} className="object-cover h-full w-full object-right mix-blend-overlay" />
                  </div>
                )}
                <div className="relative z-10 max-w-[60%]">
                  {banner.tag && (
                    <span className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3">
                      {banner.tag}
                    </span>
                  )}
                  <h2 className="text-xl md:text-3xl font-bold mb-3 leading-tight">{banner.title}</h2>
                  <div className="flex flex-col gap-1.5 text-xs md:text-sm font-medium text-blue-100 mb-4">
                    {(banner.date || banner.time) && (
                      <div className="flex items-center gap-2">
                        <Calendar size={14} /> {banner.date} {banner.time && `• ${banner.time}`}
                      </div>
                    )}
                    {banner.location && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} /> {banner.location}
                      </div>
                    )}
                  </div>
                  <Link to={banner.link || '#'} className="inline-flex items-center bg-white text-blue-900 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors shadow-sm">
                    View Details <ChevronRight size={14} className="ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination Dots */}
          {displayBanners.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
              {displayBanners.map((_, idx) => (
                <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeBanner ? 'bg-white w-4' : 'bg-white/50'}`} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-900 text-sm md:text-base">Quick Actions</h2>
            <Link className="text-xs text-blue-600 font-bold flex items-center hover:text-blue-800 transition-colors">
              View All <ChevronRight size={14} className="ml-0.5"/>
            </Link>
          </div>
          <div className="flex justify-between md:justify-start gap-4 md:gap-8 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-2">
            {[
              { label: 'Timetable', icon: <Calendar size={22}/>, color: 'text-blue-600', bg: 'bg-blue-50', link: '/student/timetable' },
              { label: 'Faculty Connect', icon: <UserCheck size={22}/>, color: 'text-green-600', bg: 'bg-green-50', link: '/student/faculty-connect' },
              { label: 'My QR Pass', icon: <CreditCard size={22}/>, color: 'text-orange-500', bg: 'bg-orange-50', link: '#' },
              { label: 'Announcements', icon: <Megaphone size={22}/>, color: 'text-pink-500', bg: 'bg-pink-50', link: '/student/announcements' },
              { label: 'More', icon: <Grid size={22}/>, color: 'text-blue-500', bg: 'bg-blue-50', link: '#' }
            ].map((action, idx) => (
              <Link key={idx} to={action.link} className="flex flex-col items-center gap-2 min-w-[70px] group">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${action.bg} ${action.color} group-hover:-translate-y-1 transition-transform border border-white`}>
                  {action.icon}
                </div>
                <span className="text-[10px] md:text-xs font-bold text-gray-700 text-center leading-tight">
                  {action.label.split(' ').map((word, i) => <React.Fragment key={i}>{word}<br/></React.Fragment>)}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Today's Schedule */}
          <div className="bg-white rounded-3xl p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col h-full">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Calendar size={18} className="text-blue-500"/> Today's Schedule
              </h3>
              <ChevronRight size={16} className="text-gray-400"/>
            </div>
            <div className="flex-1 flex flex-col gap-3">
              {todaySchedule.map((item, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border-l-4 bg-${item.color}-50/50 border-${item.color}-500 flex gap-4`}>
                  <div className={`text-${item.color}-600 font-bold text-xs whitespace-nowrap pt-1`}>{item.time}</div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{item.subject}</h4>
                    <div className="text-xs text-gray-500 mt-1">{item.class}</div>
                    <div className="text-[10px] font-semibold text-blue-600 mt-1 flex items-center gap-1">
                      <MapPin size={12}/> {item.room}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/student/timetable" className="mt-5 text-center text-xs font-bold text-blue-600 block hover:text-blue-800 transition-colors">
              View Full Timetable
            </Link>
          </div>

          {/* Latest Announcements */}
          <div className="bg-white rounded-3xl p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col h-full">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Megaphone size={18} className="text-blue-500"/> Latest Announcements
              </h3>
              <ChevronRight size={16} className="text-gray-400"/>
            </div>
            <div className="flex-1 flex flex-col gap-3">
              {recentAnnouncements.length === 0 ? (
                <div className="text-sm text-gray-400 text-center py-6">No announcements today</div>
              ) : (
                recentAnnouncements.map((item, idx) => (
                  <Link key={item._id} to={`/announcement/${item._id}`} className="p-4 rounded-2xl border border-gray-100 flex gap-3 hover:bg-gray-50 transition-colors">
                    <div className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-1 rounded h-fit whitespace-nowrap mt-0.5">
                      {item.priority === 'urgent' ? 'Important' : 'New'}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug">{item.title}</h4>
                      <div className="text-xs text-gray-400 mt-2 flex items-center gap-2 font-medium">
                        {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span> Admin
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
            <Link to="/student/announcements" className="mt-5 text-center text-xs font-bold text-blue-600 block hover:text-blue-800 transition-colors">
              View All Announcements
            </Link>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-900 text-sm md:text-base">Upcoming Events</h2>
            <Link to="/student/calendar" className="text-xs text-blue-600 font-bold flex items-center hover:text-blue-800 transition-colors">
              View Calendar <ChevronRight size={14} className="ml-0.5"/>
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden pb-4">
            {upcomingEvents.length === 0 ? (
              <div className="text-sm text-gray-500 p-4 border border-gray-200 border-dashed rounded-2xl w-full text-center">
                No upcoming events this month
              </div>
            ) : (
              upcomingEvents.map((event, idx) => {
                const colors = ['purple', 'green', 'orange'];
                const c = colors[idx % colors.length];
                return (
                  <Link key={event._id} to={`/activity/${event._id}`} className={`min-w-[240px] w-[240px] snap-center bg-${c}-50 rounded-3xl p-5 border border-${c}-100 relative group hover:shadow-md transition-all`}>
                    <Bookmark size={16} className={`absolute top-5 right-5 text-${c}-300`} />
                    <div className={`text-3xl font-black text-${c}-600 mb-1`}>{new Date(event.startDate).getDate()}</div>
                    <div className={`text-xs font-black text-${c}-400 uppercase tracking-widest mb-4`}>{new Date(event.startDate).toLocaleString('default', { month: 'short' })}</div>
                    <h3 className="font-bold text-gray-900 text-sm mb-3 line-clamp-2 h-10">{event.title}</h3>
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5">
                        <MapPin size={12}/> {event.venue || 'TBA'}
                      </div>
                      <div className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5">
                        <Clock size={12}/> {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Placement Readiness */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-900 text-sm md:text-base">Placement Readiness</h2>
            <Link to="/student/placement-readiness" className="text-xs text-blue-600 font-bold flex items-center hover:text-blue-800 transition-colors">
              View Progress <ChevronRight size={14} className="ml-0.5"/>
            </Link>
          </div>
          
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="flex items-center gap-6">
              {/* Circular Progress Ring Mock */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                  <circle cx="50" cy="50" r="45" stroke="#22c55e" strokeWidth="8" fill="none" strokeDasharray="283" strokeDashoffset="50" className="drop-shadow-md" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xl font-black text-gray-900">82%</span>
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest text-center leading-tight mt-1">Overall<br/>Score</span>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 flex items-center gap-1">Great Progress 🚀</h3>
                <p className="text-xs text-gray-500 font-medium mt-1 mb-3 max-w-[150px] leading-relaxed">
                  Keep it up! You're doing better than 78% of students.
                </p>
                <button className="bg-green-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-sm hover:bg-green-600 transition-colors">
                  Improve Now
                </button>
              </div>
            </div>
            
            <div className="flex-1 w-full flex flex-col gap-4 border-t border-gray-100 pt-5 md:border-t-0 md:pt-0 md:border-l md:pl-10">
              {[
                { label: 'Aptitude', val: 88, color: 'bg-green-500' },
                { label: 'DSA', val: 70, color: 'bg-orange-500' },
                { label: 'Core Subjects', val: 90, color: 'bg-green-500' },
                { label: 'Communication', val: 75, color: 'bg-yellow-500' }
              ].map((skill, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-gray-600 w-24">{skill.label}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${skill.color} rounded-full`} style={{ width: `${skill.val}%` }}></div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 w-6 text-right">{skill.val}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;