import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { useSearchParams } from 'react-router-dom';
import { Send, Search, Check, CheckCheck, Users, UserCircle, MessageSquare, Trash2, Reply, X, ArrowLeft } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import { encryptMessage, decryptMessage } from '../../utils/encryption';

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
  const [replyingTo, setReplyingTo] = useState(null);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef(null);
  const socket = useSocket();

  // Fetch Conversations
  const fetchConversations = async () => {
    try {
      const url = initialUserId ? `/chat/conversations?userId=${initialUserId}` : '/chat/conversations';
      const res = await api.get(url, { skipCache: true });
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
          ...groups.map(g => ({ ...g, isGroup: true, lastMessage: decryptMessage(g.lastMessage) })),
          ...allDirects.map(d => ({ ...d, isGroup: false, lastMessage: decryptMessage(d.lastMessage) }))
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
      const res = await api.get(`/chat/messages?${query}`, { skipCache: true });
      if (res.data.success) {
        const decryptedMessages = res.data.data.map(m => ({
          ...m,
          content: m.isDeleted ? m.content : decryptMessage(m.content),
          replyTo: m.replyTo ? { ...m.replyTo, content: m.replyTo.isDeleted ? m.replyTo.content : decryptMessage(m.replyTo.content) } : null
        }));
        setMessages(decryptedMessages);
        
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
      newMsg.content = newMsg.isDeleted ? newMsg.content : decryptMessage(newMsg.content);
      if (newMsg.replyTo) {
         newMsg.replyTo.content = newMsg.replyTo.isDeleted ? newMsg.replyTo.content : decryptMessage(newMsg.replyTo.content);
      }
      // Update the left sidebar locally without hitting the server!
      setConversations(prev => {
        const updated = prev.map(chat => {
          const isDirectMatch = !chat.isGroup && !newMsg.groupId && 
            (newMsg.sender._id === chat._id || newMsg.receiver === chat._id);
          const isGroupMatch = chat.isGroup && newMsg.groupId === chat._id;
          
          if (isDirectMatch || isGroupMatch) {
            const isCurrentlyOpen = selectedChat && selectedChat._id === chat._id;
            const shouldIncrementUnread = (newMsg.sender._id !== user._id) && !isCurrentlyOpen;
            
            return {
              ...chat,
              lastMessage: newMsg.content,
              lastMessageTime: newMsg.createdAt,
              unreadCount: shouldIncrementUnread ? (chat.unreadCount || 0) + 1 : chat.unreadCount
            };
          }
          return chat;
        });
        
        return updated.sort((a, b) => {
          const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
          const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
          return timeB - timeA;
        });
      });

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

    const handleMessageDeleted = ({ messageId }) => {
      setMessages(prev => prev.map(m => {
        if (m._id === messageId) {
          return { ...m, isDeleted: true, content: 'This message was deleted' };
        }
        if (m.replyTo && m.replyTo._id === messageId) {
          return { ...m, replyTo: { ...m.replyTo, isDeleted: true, content: 'This message was deleted' } };
        }
        return m;
      }));
      fetchConversations();
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('messageRead', handleMessageRead);
    socket.on('messageDeleted', handleMessageDeleted);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messageRead', handleMessageRead);
      socket.off('messageDeleted', handleMessageDeleted);
    };
  }, [socket, selectedChat, user._id]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || isSending) return;

    setIsSending(true);
    try {
      const payload = {
        content: encryptMessage(newMessage),
        replyTo: replyingTo ? replyingTo._id : undefined
      };
      if (selectedChat.isGroup) {
        payload.groupId = selectedChat._id;
      } else {
        payload.receiverId = selectedChat._id;
      }

      const res = await api.post('/chat/messages', payload);
      if (res.data.success) {
        const sentMsg = res.data.data;
        sentMsg.content = sentMsg.isDeleted ? sentMsg.content : decryptMessage(sentMsg.content);
        if (sentMsg.replyTo && sentMsg.replyTo.content) {
            sentMsg.replyTo.content = sentMsg.replyTo.isDeleted ? sentMsg.replyTo.content : decryptMessage(sentMsg.replyTo.content);
        }
        setMessages(prev => {
          if (prev.find(m => m._id === sentMsg._id)) return prev;
          return [...prev, sentMsg];
        });
        setNewMessage('');
        setReplyingTo(null);
        fetchConversations(); // Update last message in list
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const res = await api.delete(`/chat/messages/${messageId}`);
      if (res.data.success) {
         setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isDeleted: true, content: 'This message was deleted' } : m));
         fetchConversations();
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleDeleteChat = async () => {
    if (!window.confirm('Are you sure you want to delete this conversation? This will delete all messages for both of you.')) return;
    try {
      const url = selectedChat.isGroup 
        ? `/chat/conversations/group/${selectedChat._id}` 
        : `/chat/conversations/${selectedChat._id}`;
      const res = await api.delete(url);
      if (res.data.success) {
        setSelectedChat(null);
        setMessages([]);
        fetchConversations();
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Cannot delete this chat or an error occurred.');
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-[calc(100dvh-5rem)] md:h-[calc(100vh-5rem)] w-full max-w-7xl mx-auto md:py-4">
      <div className="flex w-full h-full bg-white md:rounded-2xl shadow-xl border-x md:border border-gray-200 overflow-hidden relative">
        
        {/* Left Pane - Inbox */}
        <div className={`flex w-full md:w-[350px] lg:w-[400px] flex-col border-r border-gray-200 bg-white shrink-0 transition-transform duration-300 ${selectedChat ? '-translate-x-full absolute md:relative md:translate-x-0' : 'translate-x-0'}`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-white z-10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MessageSquare size={24} className="text-indigo-600" />
                Messages
              </h2>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100/80 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all text-sm font-medium"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {filteredConversations.length > 0 ? (
              <div className="p-2 space-y-0.5">
                {filteredConversations.map(chat => (
                  <button
                    key={chat._id}
                    onClick={() => setSelectedChat(chat)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                      selectedChat?._id === chat._id 
                        ? 'bg-indigo-50/80' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      {chat.isGroup ? (
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${
                          chat.type === 'proctor' ? 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700' : 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700'
                        }`}>
                          <Users size={22} />
                        </div>
                      ) : chat.profilePicture ? (
                        <img src={chat.profilePicture} alt={chat.name} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-lg shadow-sm">
                          {chat.name?.charAt(0)}
                        </div>
                      )}
                      {chat.unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-indigo-600 text-white text-[10px] font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full border-2 border-white px-1">
                          {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 text-left py-1">
                      <div className="flex justify-between items-center mb-0.5">
                        <h3 className="font-semibold text-gray-900 truncate pr-2 text-[15px]">{chat.name}</h3>
                        {chat.lastMessageTime && (
                          <span className={`text-[11px] whitespace-nowrap ${chat.unreadCount > 0 ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>
                            {formatTime(chat.lastMessageTime)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`text-[13px] truncate pr-2 ${chat.unreadCount > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                          {chat.lastMessage || (chat.isGroup ? 'Tap to view group chat' : 'Start a conversation')}
                        </p>
                        {chat.label && !chat.isGroup && (
                          <span className="text-[9px] uppercase font-bold text-indigo-600 bg-indigo-100/50 px-1.5 py-0.5 rounded flex-shrink-0">
                            {chat.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare size={28} className="text-gray-300" />
                </div>
                <p className="font-medium text-gray-600">No conversations</p>
                <p className="text-sm mt-1">Search or start a new chat</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane - Chat Window */}
        <div className={`flex-1 flex-col bg-[#f0f2f5] w-full h-full relative transition-transform duration-300 ${!selectedChat ? 'hidden md:flex translate-x-full md:translate-x-0' : 'flex translate-x-0'}`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="h-16 px-4 py-2 bg-white/90 backdrop-blur-md border-b border-gray-200 flex items-center justify-between z-20 shrink-0">
                <div className="flex items-center gap-3 overflow-hidden">
                  <button 
                    onClick={() => setSelectedChat(null)} 
                    className="md:hidden p-2 -ml-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors"
                  >
                    <ArrowLeft size={22} />
                  </button>
                  
                  <div className="relative">
                    {selectedChat.isGroup ? (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        selectedChat.type === 'proctor' ? 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700' : 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700'
                      }`}>
                        <Users size={20} />
                      </div>
                    ) : selectedChat.profilePicture ? (
                      <img src={selectedChat.profilePicture} alt={selectedChat.name} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 flex items-center justify-center font-bold shadow-sm">
                        {selectedChat.name?.charAt(0)}
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 truncate text-[15px] leading-tight">{selectedChat.name}</h3>
                    <p className="text-[12px] text-gray-500 truncate mt-0.5">
                      {selectedChat.isGroup ? 'Group members can see messages' : selectedChat.department || (selectedChat.role?.charAt(0).toUpperCase() + selectedChat.role?.slice(1))}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button 
                    onClick={handleDeleteChat}
                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete Conversation"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 relative scroll-smooth overscroll-contain bg-[#efeae2]" style={{ backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)', backgroundSize: '24px 24px', backgroundColor: '#f0f2f5' }}>
                {/* Date separator example (if we were to implement grouping by date) */}
                <div className="flex justify-center mb-6">
                  <span className="text-[11px] font-medium text-gray-500 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                    End-to-end encrypted
                  </span>
                </div>

                {messages.map((msg, index) => {
                  const isMine = msg.sender?._id === user._id;
                  const showSenderName = selectedChat.isGroup && !isMine && (index === 0 || messages[index-1].sender?._id !== msg.sender?._id);

                  return (
                    <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                      <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[75%] md:max-w-[65%]`}>
                        {showSenderName && (
                          <span className="text-[11px] font-semibold text-gray-500 mb-1 ml-3">{msg.sender?.name || 'Deleted User'}</span>
                        )}
                        
                        <div className="flex items-end gap-2 relative">
                          <div className={`px-4 py-2.5 shadow-sm relative ${
                            isMine 
                              ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm' 
                              : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-gray-100'
                          } ${msg.isDeleted ? 'italic !bg-gray-100 !text-gray-500 !border-transparent shadow-none' : ''}`}>
                            
                            {/* Reply Preview inside bubble */}
                            {msg.replyTo && (
                              <div className={`mb-2 p-2 rounded-lg text-[13px] border-l-4 max-w-full truncate ${
                                isMine ? 'bg-indigo-700/30 border-indigo-300 text-indigo-50' : 'bg-gray-50 border-indigo-400 text-gray-600'
                              }`}>
                                <span className={`font-semibold block text-[11px] ${isMine ? 'text-indigo-200' : 'text-indigo-600'}`}>
                                  {msg.replyTo.sender?.name || 'Unknown'}
                                </span>
                                <span className="opacity-90">{msg.replyTo.content}</span>
                              </div>
                            )}
                            
                            <p className="whitespace-pre-wrap text-[14px] leading-relaxed break-words">{msg.content}</p>
                            
                            {/* Timestamp & Status inside bubble */}
                            <div className={`flex items-center justify-end gap-1 mt-1 -mr-1 text-[10px] ${isMine ? 'text-indigo-200' : 'text-gray-400'}`}>
                              <span>{formatTime(msg.createdAt)}</span>
                              {isMine && !selectedChat.isGroup && (
                                msg.readBy.length > 1 ? <CheckCheck size={14} className="text-blue-300" /> : <Check size={14} />
                              )}
                              {isMine && selectedChat.isGroup && msg.readBy.length > 1 && (
                                <div className="group/seen relative cursor-pointer flex items-center">
                                  <CheckCheck size={14} className="text-blue-300" />
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Hover Actions */}
                          <div className={`absolute top-1/2 -translate-y-1/2 flex gap-1 transition-all opacity-0 md:group-hover:opacity-100 scale-95 md:group-hover:scale-100 ${
                            isMine ? '-left-14' : '-right-10'
                          }`}>
                            {!msg.isDeleted && (
                              <button onClick={() => setReplyingTo(msg)} className="p-1.5 text-gray-400 hover:text-indigo-600 bg-white rounded-full shadow-md border border-gray-100 hover:scale-110 transition-all" title="Reply">
                                <Reply size={14} />
                              </button>
                            )}
                            {isMine && !msg.isDeleted && (
                              <button onClick={() => handleDeleteMessage(msg._id)} className="p-1.5 text-gray-400 hover:text-red-500 bg-white rounded-full shadow-md border border-gray-100 hover:scale-110 transition-all" title="Delete">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} className="h-4" />
              </div>

              {/* Input Area */}
              <div className="bg-white px-4 py-3 border-t border-gray-200 shrink-0 z-20">
                {replyingTo && (
                  <div className="mb-3 px-4 py-3 bg-gray-50 border-l-4 border-indigo-500 rounded-r-xl flex items-center justify-between relative shadow-sm animate-in slide-in-from-bottom-2">
                    <div className="flex flex-col text-sm truncate max-w-[85%]">
                      <span className="text-xs font-bold text-indigo-600 mb-0.5">Replying to {replyingTo.sender?.name || 'Unknown'}</span>
                      <span className="text-gray-600 truncate text-[13px]">{replyingTo.content}</span>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                )}
                
                <form onSubmit={handleSendMessage} className="flex items-end gap-2 md:gap-3 relative">
                  <div className="flex-1 bg-gray-100 rounded-2xl flex items-center border border-transparent focus-within:border-indigo-300 focus-within:bg-white focus-within:shadow-sm transition-all relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      disabled={isSending}
                      className="w-full bg-transparent px-5 py-3 md:py-3.5 focus:outline-none text-[15px] disabled:opacity-50"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="bg-indigo-600 text-white p-3.5 rounded-full hover:bg-indigo-700 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 active:scale-95 flex items-center justify-center h-[52px] w-[52px]"
                  >
                    <Send size={20} className="ml-1" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-[#f0f2f5] text-center p-8">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                <MessageSquare size={40} className="text-indigo-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">CampX Messages</h3>
              <p className="text-gray-500 max-w-sm">Select a conversation from the left to start messaging, or search for a student or faculty member.</p>
              <div className="mt-8 flex items-center gap-2 text-xs text-gray-400 font-medium bg-white px-4 py-2 rounded-full shadow-sm">
                <CheckCheck size={14} className="text-green-500" /> End-to-end encrypted
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
