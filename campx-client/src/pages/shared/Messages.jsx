import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import { useSearchParams } from 'react-router-dom';
import { Send, Search, Check, CheckCheck, Users, UserCircle, MessageSquare } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';

const Messages = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialUserId = searchParams.get('userId');

  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null); // { type: 'direct'|'group', id: string, name: string, ... }
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const messagesEndRef = useRef(null);
  const socket = useSocket();

  // Fetch Conversations
  const fetchConversations = async () => {
    try {
      const url = initialUserId ? `/chat/conversations?userId=${initialUserId}` : '/chat/conversations';
      const res = await api.get(url);
      if (res.data.success) {
        const { direct, defaultContacts, groups } = res.data.data;
        
        // Combine direct and default contacts (avoid duplicates)
        const allDirects = [...direct];
        defaultContacts.forEach(dc => {
          if (!allDirects.find(d => d._id === dc._id)) {
            allDirects.push({
              ...dc,
              lastMessage: '',
              lastMessageTime: null,
              unreadCount: 0
            });
          } else if (dc.label) {
             const existing = allDirects.find(d => d._id === dc._id);
             existing.label = dc.label;
          }
        });

        const formattedChats = [
          ...groups.map(g => ({ ...g, isGroup: true })),
          ...allDirects.map(d => ({ ...d, isGroup: false }))
        ].sort((a, b) => {
          const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
          const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
          return timeB - timeA;
        });

        setConversations(formattedChats);
        
        // Auto select if userId is provided
        if (initialUserId && !selectedChat) {
           const initial = formattedChats.find(c => !c.isGroup && c._id === initialUserId);
           if (initial) setSelectedChat(initial);
        }

        // Join socket rooms for all groups
        if (socket) {
          groups.forEach(g => {
            socket.emit('join', g._id);
          });
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [initialUserId]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredConversations(conversations);
    } else {
      setFilteredConversations(
        conversations.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
  }, [searchQuery, conversations]);

  // Fetch Messages for selected chat
  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const query = selectedChat.isGroup ? `groupId=${selectedChat._id}` : `userId=${selectedChat._id}`;
      const res = await api.get(`/chat/messages?${query}`);
      if (res.data.success) {
        setMessages(res.data.data);
        
        // Mark as read
        const hasUnread = res.data.data.some(m => !m.readBy.includes(user._id));
        if (hasUnread) {
          await api.post('/chat/read', selectedChat.isGroup ? { groupId: selectedChat._id } : { userId: selectedChat._id });
          fetchConversations(); // Update unread count
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedChat]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMsg) => {
      // If the message belongs to the currently open chat, append it
      if (selectedChat) {
        const isForCurrentDirectChat = !selectedChat.isGroup && !newMsg.groupId && 
          (newMsg.sender._id === selectedChat._id || newMsg.receiver === selectedChat._id);
        const isForCurrentGroupChat = selectedChat.isGroup && newMsg.groupId === selectedChat._id;

        if (isForCurrentDirectChat || isForCurrentGroupChat) {
          setMessages(prev => {
            if (prev.find(m => m._id === newMsg._id)) return prev;
            return [...prev, newMsg];
          });
          
          // Auto mark as read if it's not sent by me
          if (newMsg.sender._id !== user._id) {
             api.post('/chat/read', selectedChat.isGroup ? { groupId: selectedChat._id } : { userId: selectedChat._id });
          }
        }
      }
      // Refresh the sidebar conversation list for unread counts and last message
      fetchConversations();
    };

    const handleMessageRead = ({ groupId, userId, readBy }) => {
      // Update readBy array in messages if the chat matches
      if (selectedChat) {
        const isForCurrentDirectChat = !selectedChat.isGroup && userId === selectedChat._id;
        const isForCurrentGroupChat = selectedChat.isGroup && groupId === selectedChat._id;

        if (isForCurrentDirectChat || isForCurrentGroupChat) {
          setMessages(prev => prev.map(m => {
            if (!m.readBy.includes(readBy)) {
              return { ...m, readBy: [...m.readBy, readBy] };
            }
            return m;
          }));
        }
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('messageRead', handleMessageRead);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messageRead', handleMessageRead);
    };
  }, [socket, selectedChat, user._id]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const payload = {
        content: newMessage,
      };
      if (selectedChat.isGroup) {
        payload.groupId = selectedChat._id;
      } else {
        payload.receiverId = selectedChat._id;
      }

      const res = await api.post('/chat/messages', payload);
      if (res.data.success) {
        setMessages(prev => [...prev, res.data.data]);
        setNewMessage('');
        fetchConversations(); // Update last message in list
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Left Pane - Inbox */}
      <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MessageSquare size={24} className="text-blue-600" />
            Messages
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.length > 0 ? (
            filteredConversations.map(chat => (
              <button
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all ${
                  selectedChat?._id === chat._id 
                    ? 'bg-blue-50 border border-blue-100' 
                    : 'hover:bg-gray-100 border border-transparent'
                }`}
              >
                <div className="relative flex-shrink-0">
                  {chat.isGroup ? (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      chat.type === 'proctor' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      <Users size={24} />
                    </div>
                  ) : chat.profilePicture ? (
                    <img src={chat.profilePicture} alt={chat.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                      {chat.name?.charAt(0)}
                    </div>
                  )}
                  {chat.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-gray-900 truncate pr-2">{chat.name}</h3>
                    {chat.lastMessageTime && (
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    )}
                  </div>
                  {chat.label && !chat.isGroup && (
                    <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-1 inline-block">
                      {chat.label}
                    </span>
                  )}
                  <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    {chat.lastMessage || (chat.isGroup ? 'Group chat' : 'Start a conversation')}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="mx-auto text-gray-300 mb-2" size={32} />
              <p>No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Pane - Chat Window */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4 bg-white">
              {selectedChat.isGroup ? (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedChat.type === 'proctor' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  <Users size={20} />
                </div>
              ) : selectedChat.profilePicture ? (
                <img src={selectedChat.profilePicture} alt={selectedChat.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  {selectedChat.name?.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="font-bold text-gray-900">{selectedChat.name}</h3>
                <p className="text-xs text-gray-500">
                  {selectedChat.isGroup ? 'Group Chat' : selectedChat.role?.charAt(0).toUpperCase() + selectedChat.role?.slice(1)}
                  {!selectedChat.isGroup && selectedChat.department && ` • ${selectedChat.department}`}
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {messages.map((msg, index) => {
                const isMine = msg.sender._id === user._id;
                const showSenderName = selectedChat.isGroup && !isMine && (index === 0 || messages[index-1].sender._id !== msg.sender._id);

                return (
                  <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[70%]`}>
                      {showSenderName && (
                        <span className="text-xs text-gray-500 mb-1 ml-1">{msg.sender.name}</span>
                      )}
                      <div className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                        isMine 
                          ? 'bg-blue-600 text-white rounded-br-sm' 
                          : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
                      }`}>
                        <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                        <span>{formatTime(msg.createdAt)}</span>
                        {isMine && !selectedChat.isGroup && (
                          msg.readBy.length > 1 ? <CheckCheck size={12} className="text-blue-500" /> : <Check size={12} />
                        )}
                        {isMine && selectedChat.isGroup && msg.readBy.length > 1 && (
                          <div className="group relative cursor-pointer flex items-center gap-1">
                            <CheckCheck size={12} className="text-blue-500" />
                            <span>Seen by {msg.readBy.length - 1}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-slate-50/50">
            <MessageSquare size={48} className="mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
