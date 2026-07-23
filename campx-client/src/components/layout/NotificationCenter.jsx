import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Bell, CheckCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationCenter = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, setNotifications, setUnreadCount } = useNotifications();

  const handleNotificationClick = (notif) => {
    onClose();
    if (!notif.isRead && notif._id) {
      import('../../services/api').then(({ default: api }) => {
        api.put(`/notifications/${notif._id}`).catch(err => console.error(err));
      });
      if (typeof markAsRead === 'function') markAsRead(notif._id);
    }
    
    if (notif.type === 'message') {
      let queryParam = 'userId=';
      if (notif.relatedId?.startsWith('class_') || notif.relatedId?.startsWith('subjectGroup_') || notif.relatedId?.startsWith('proctor_')) {
        queryParam = 'groupId=';
      }
      // navigate(`/${user?.role === 'admin' ? 'admin' : user?.role}/messages?${queryParam}${notif.relatedId}`);
      navigate(`/${user?.role === 'admin' ? 'admin' : user?.role}/notifications`);
    } else {
      navigate(`/${user?.role === 'admin' ? 'admin' : user?.role}/notifications`);
    }
  };

  const handleMarkAllRead = () => {
    import('../../services/api').then(({ default: api }) => {
      api.put('/notifications/mark-all-read').catch(err => console.error(err));
    });
    setNotifications([]);
    setUnreadCount(0);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[70] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div 
        className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-[80] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Bell size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Notifications</h2>
              <p className="text-xs text-gray-500 font-medium">{unreadCount} unread messages</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
               <button 
                 onClick={handleMarkAllRead}
                 className="p-2 rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
                 title="Mark all as read"
               >
                 <CheckCheck size={18} />
               </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-3 space-y-2">
          {notifications?.length > 0 ? (
            notifications.map((notif, idx) => (
              <button 
                key={idx} 
                onClick={() => handleNotificationClick(notif)}
                className={`w-full flex items-start gap-3 p-4 rounded-2xl transition-all text-left border ${
                  notif.isRead 
                    ? 'bg-white border-gray-100 hover:border-gray-200 shadow-sm' 
                    : 'bg-blue-50 border-blue-100 hover:border-blue-200 shadow-sm'
                }`}
              >
                {!notif.isRead && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${notif.isRead ? 'text-gray-800' : 'text-blue-900'}`}>
                    {notif.title}
                  </p>
                  <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${notif.isRead ? 'text-gray-500' : 'text-blue-700/80'}`}>
                    {notif.message}
                  </p>
                  <p className="text-[10px] font-medium text-gray-400 mt-2 uppercase tracking-wider">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center px-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Bell size={28} className="text-gray-300" />
              </div>
              <h3 className="text-gray-900 font-bold mb-1">All caught up!</h3>
              <p className="text-sm text-gray-500">You don't have any new notifications at the moment.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <Link
            to={`/${user?.role === 'admin' ? 'admin' : user?.role}/notifications`}
            onClick={onClose}
            className="flex items-center justify-center w-full py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-md"
          >
            View Full Inbox
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotificationCenter;
