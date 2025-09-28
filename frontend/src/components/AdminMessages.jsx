import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiUser, FiMail, FiClock, FiTrash2, FiCheck } from 'react-icons/fi';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState('unread');

  // Mock messages data
  useEffect(() => {
    const mockMessages = [
      {
        id: 3001,
        name: 'David Wilson',
        email: 'david@example.com',
        subject: 'Great food experience!',
        message: 'I wanted to thank you for the amazing burgers. The service was excellent and the food was delicious!',
        date: '2024-01-14T16:30:00',
        read: false,
        type: 'compliment'
      },
      {
        id: 3002,
        name: 'Jennifer Lopez',
        email: 'jennifer@example.com',
        subject: 'Allergy concern',
        message: 'Do your burgers contain any nuts? I have a severe nut allergy and want to make sure it\'s safe to eat.',
        date: '2024-01-14T14:15:00',
        read: true,
        type: 'question'
      },
      {
        id: 3003,
        name: 'Michael Chen',
        email: 'michael@example.com',
        subject: 'Catering inquiry',
        message: 'I\'m planning a corporate event for 50 people next month. Do you offer catering services?',
        date: '2024-01-14T10:45:00',
        read: false,
        type: 'inquiry'
      }
    ];
    setMessages(mockMessages);
  }, []);

  const filteredMessages = messages.filter(message => 
    filter === 'all' || 
    (filter === 'unread' && !message.read) ||
    (filter === 'read' && message.read)
  );

  const markAsRead = (id) => {
    setMessages(messages.map(msg => 
      msg.id === id ? { ...msg, read: true } : msg
    ));
  };

  const deleteMessage = (id) => {
    setMessages(messages.filter(msg => msg.id !== id));
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'compliment': return 'bg-green-100 text-green-800';
      case 'question': return 'bg-blue-100 text-blue-800';
      case 'inquiry': return 'bg-purple-100 text-purple-800';
      case 'complaint': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Messages</h2>
          <p className="text-gray-600">Manage customer inquiries and feedback</p>
        </div>
        
        {/* Filters */}
        <div className="flex space-x-2 mt-4 md:mt-0">
          {['all', 'unread', 'read'].map(filterType => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                filter === filterType
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {filterType === 'all' ? 'All Messages' : filterType}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div className="grid gap-6">
        {filteredMessages.map(message => (
          <div key={message.id} className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 ${
            message.read ? 'border-gray-300' : 'border-primary-500'
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center flex-wrap gap-2 mb-3">
                  <h3 className={`text-lg font-bold ${message.read ? 'text-gray-700' : 'text-gray-900'}`}>
                    {message.subject}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(message.type)}`}>
                    {message.type.charAt(0).toUpperCase() + message.type.slice(1)}
                  </span>
                  {!message.read && (
                    <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                      New
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <FiUser className="mr-2" />
                    <span>{message.name}</span>
                  </div>
                  <div className="flex items-center">
                    <FiMail className="mr-2" />
                    <span>{message.email}</span>
                  </div>
                  <div className="flex items-center">
                    <FiClock className="mr-2" />
                    <span>{new Date(message.date).toLocaleString()}</span>
                  </div>
                </div>
                
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {message.message}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 mt-4 lg:mt-0">
                {!message.read && (
                  <button
                    onClick={() => markAsRead(message.id)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
                  >
                    <FiCheck className="mr-2" />
                    Mark Read
                  </button>
                )}
                <button
                  onClick={() => deleteMessage(message.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
                >
                  <FiTrash2 className="mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMessages.length === 0 && (
        <div className="text-center py-12">
          <FiMessageSquare className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No messages found</h3>
          <p className="text-gray-600">There are no messages matching your filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;