import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  PaperAirplaneIcon,
  UserIcon,
  ShieldCheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useLocation } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

interface Message {
  id: string;
  senderId: string;
  senderRole: 'user' | 'admin' | 'moderator';
  message: string;
  timestamp: string;
  isAnonymous: boolean;
}

interface ChatRoom {
  _id: string;
  reportId: string;
  participants: string[];
  lastMessage: Message | null;
  createdAt: string;
}

const Chat: React.FC = () => {
  const location = useLocation();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [reportStatus, setReportStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();
  const { notifications, markAsRead } = useNotifications();
  const [showSidebarMobile, setShowSidebarMobile] = useState(true); // mobile: show sidebar or chat
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);

  useEffect(() => {
    // Connect to Socket.IO server
    const token = localStorage.getItem('token');
    const socket = io(process.env.REACT_APP_SOCKET_URL, {
      auth: { token },
      transports: ['websocket']
    });
    socketRef.current = socket;
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchChatRooms();
  }, []);

  // Auto-select chat room if reportId is in the URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reportId = params.get('reportId');
    if (reportId) {
      const room = chatRooms.find(r => r.reportId === reportId);
      if (room) {
        setSelectedRoom(room._id);
      } else {
        // Create the chat room if it doesn't exist
        const createRoom = async () => {
          try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/room`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ reportId })
            });
            const data = await response.json();
            if (response.ok && data.room) {
              setChatRooms(prev => {
                // Remove any room with the same roomId or reportId
                const filtered = prev.filter(r => r._id !== data.room._id && r.reportId !== data.room.reportId);
                return [...filtered, data.room];
              });
              setSelectedRoom(data.room._id);
            }
          } catch (err) {
            // Optionally handle error
          }
        };
        createRoom();
      }
    }
  }, [location.search, chatRooms]);

  useEffect(() => {
    if (selectedRoom && socketRef.current) {
      // Join the selected room
      socketRef.current.emit('join_chat_room', selectedRoom);
      // Listen for new messages
      socketRef.current.on('new_message', (msg: Message) => {
        setMessages(prev => [...prev, msg]);
      });
      return () => {
        socketRef.current?.emit('leave_chat_room', selectedRoom);
        socketRef.current?.off('new_message');
      };
    }
  }, [selectedRoom]);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom);
      // Fetch report status for the selected chat room
      const room = chatRooms.find(r => r._id === selectedRoom);
      if (room && room.reportId) {
        fetch(`${process.env.REACT_APP_API_URL}/api/reports/${room.reportId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.report) {
              setReportStatus(data.report.status);
            } else {
              setReportStatus(null);
            }
          })
          .catch(() => setReportStatus(null));
      } else {
        setReportStatus(null);
      }
    }
  }, [selectedRoom, chatRooms]);

  // Mark notifications as read when chat room is opened
  useEffect(() => {
    if (selectedRoom) {
      notifications
        .filter(n => n.link === `/chat?roomId=${selectedRoom}` && !n.read)
        .forEach(n => markAsRead(n.id));
    }
  }, [selectedRoom, notifications, markAsRead]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatRooms = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/rooms`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chat rooms');
      }

      const data = await response.json();
      setChatRooms(data.rooms || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/room/${roomId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;
    setSending(true);
    try {
      // Save message via REST API for persistence
      await fetch(`${process.env.REACT_APP_API_URL}/api/chat/room/${selectedRoom}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: newMessage })
      });
      // Optionally, still emit via Socket.IO for real-time updates
      socketRef.current?.emit('send_message', {
        roomId: selectedRoom,
        message: newMessage
      });
      setNewMessage('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // When a chat is selected on mobile, show chat view
  const handleSelectRoom = (roomId: string) => {
    setSelectedRoom(roomId);
    if (window.innerWidth < 768) setShowSidebarMobile(false);
  };
  // When back is pressed on mobile, show sidebar
  const handleBackToSidebar = () => setShowSidebarMobile(true);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="card">
          <LoadingSpinner text="Loading chat rooms..." />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-100px)]">
      <div className="card h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Anonymous Chat</h1>
          <div className="text-sm text-gray-500">
            {chatRooms.length} active conversation{chatRooms.length !== 1 ? 's' : ''}
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-danger-50 border border-danger-200 rounded-md p-4">
            <p className="text-sm text-danger-700">{error}</p>
          </div>
        )}

        <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
          {/* Chat Rooms Sidebar */}
          <div className={`w-full md:w-80 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col ${showSidebarMobile ? '' : 'hidden'} md:flex`}>
            <div className="flex-1 overflow-y-auto">
              {chatRooms.length === 0 ? (
                <div className="text-center py-8">
                  <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                  <p className="text-gray-600">
                    Start a conversation by reporting an incident and requesting follow-up.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {chatRooms.map((room) => (
                    <div
                      key={room._id}
                      onClick={() => handleSelectRoom(room._id)}
                      className={`p-4 rounded-lg cursor-pointer transition-colors truncate max-w-full ${
                        selectedRoom === room._id
                          ? 'bg-primary-50 border border-primary-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900 truncate max-w-[120px]">
                          {room.reportId ? `Report #${room.reportId.slice(-8)}` : 'Chat'}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatTime(room.createdAt)}
                        </span>
                      </div>
                      {/* Remove or truncate ObjectId display */}
                      {/* <div className="text-xs text-gray-400 truncate max-w-[120px]">{room._id}</div> */}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {room.participants?.length || 0} participant{room.participants?.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Messages */}
          <div className={`flex-1 flex flex-col min-h-0 ${showSidebarMobile && window.innerWidth < 768 ? 'hidden' : ''} md:flex`}>
            {selectedRoom ? (
              <>
                {/* Back button for mobile */}
                <div className="md:hidden flex items-center mb-2">
                  <button onClick={handleBackToSidebar} className="mr-2 p-2 rounded hover:bg-gray-100">
                    <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
                  </button>
                  <span className="font-medium text-gray-700">Back to conversations</span>
                </div>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                      <p className="text-gray-600">
                        Start the conversation by sending a message.
                      </p>
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const isCurrentUser = user && message.senderId === user.id;
                      const showDate = index === 0 || 
                        formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);

                      return (
                        <div key={message.id}>
                          {showDate && (
                            <div className="text-center my-4">
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {formatDate(message.timestamp)}
                              </span>
                            </div>
                          )}
                          <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                              <div className={`flex items-center space-x-2 mb-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                {isCurrentUser ? (
                                  <UserIcon className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <ShieldCheckIcon className="h-4 w-4 text-primary-600" />
                                )}
                                <span className="text-xs text-gray-500">
                                  {isCurrentUser
                                    ? 'You'
                                    : message.senderRole === 'admin' || message.senderRole === 'moderator'
                                      ? 'Campus Security'
                                      : 'Anonymous User'}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatTime(message.timestamp)}
                                </span>
                              </div>
                              <div
                                className={`p-3 rounded-lg ${
                                  isCurrentUser
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                }`}
                              >
                                <p className="text-sm">{message.message}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 p-4">
                  {reportStatus === 'resolved' || reportStatus === 'closed' ? (
                    <div className="text-center text-danger-600 font-medium mb-2">
                      This chat is closed because the report is {reportStatus}.
                    </div>
                  ) : null}
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        rows={2}
                        disabled={sending || reportStatus === 'resolved' || reportStatus === 'closed'}
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sending || reportStatus === 'resolved' || reportStatus === 'closed'}
                      className="btn-primary self-end disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <LoadingSpinner size="sm" color="white" />
                      ) : (
                        <PaperAirplaneIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Press Enter to send, Shift+Enter for new line
                  </div>
                </div>
                {/* Privacy & Security link for mobile, full disclaimer for desktop */}
                <div className="mt-2">
                  <button
                    className="md:hidden text-xs text-primary-600 underline hover:text-primary-800"
                    onClick={() => setShowDisclaimerModal(true)}
                  >
                    Privacy & Security
                  </button>
                  <div className="hidden md:block mt-2 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <ExclamationTriangleIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="text-sm text-gray-600">
                        <p className="font-medium text-gray-900 mb-1">Privacy & Security</p>
                        <ul className="space-y-1">
                          <li>• All messages are encrypted and anonymous</li>
                          <li>• Your identity is protected throughout the conversation</li>
                          <li>• Messages are automatically deleted after 30 days</li>
                          <li>• Only authorized campus security personnel can access this chat</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Modal for mobile disclaimer */}
                {showDisclaimerModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 relative">
                      <button
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowDisclaimerModal(false)}
                        aria-label="Close"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="flex items-start space-x-3">
                        <ExclamationTriangleIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div className="text-sm text-gray-600">
                          <p className="font-medium text-gray-900 mb-1">Privacy & Security</p>
                          <ul className="space-y-1">
                            <li>• All messages are encrypted and anonymous</li>
                            <li>• Your identity is protected throughout the conversation</li>
                            <li>• Messages are automatically deleted after 30 days</li>
                            <li>• Only authorized campus security personnel can access this chat</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-600">
                    Choose a conversation from the sidebar to start chatting.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat; 