import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { sendMessageToRoom, subscribeToRoomMessages } from '../config/firebase';
import { Send, MessageSquare } from 'lucide-react';

const ChatWindow = ({ room }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const getOtherUser = () => {
    if (!room || !room.users || !user) return null;
    return room.users.find((u) => u._id !== user._id) || room.users[0];
  };

  const otherUser = getOtherUser();

  useEffect(() => {
    if (!room || !room._id) {
      setMessages([]);
      return;
    }

    const unsubscribe = subscribeToRoomMessages(room._id, (updatedMessages) => {
      setMessages(updatedMessages);
    });

    return () => unsubscribe();
  }, [room]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !room || !room._id || !user) return;

    const textToSend = inputText;
    setInputText('');

    await sendMessageToRoom(room._id, user._id, textToSend);
  };

  if (!room) {
    return (
      <div id="chat-window" className="chat-window empty-window">
        <div className="empty-chat-placeholder">
          <MessageSquare size={48} />
          <h2>Select a conversation</h2>
          <p>Choose an existing chat from the sidebar or click "+" to start a new message.</p>
        </div>
      </div>
    );
  }

  return (
    <div id="chat-window" className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <img
          src={otherUser?.avatar || `https://avatar.iran.liara.run/username?username=${otherUser?.fullName || 'User'}`}
          alt={otherUser?.fullName || 'User'}
          className="avatar"
        />
        <div className="header-info">
          <h3>{otherUser?.fullName || 'Chat'}</h3>
          <span className="user-sub">@{otherUser?.username}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages && messages.length > 0 ? (
          messages.map((msg, index) => {
            const isMine = msg.senderId === user?._id;
            return (
              <div
                key={index}
                className={`message-bubble-wrapper ${isMine ? 'mine' : 'other'}`}
              >
                <div className={`message-bubble ${isMine ? 'bubble-mine' : 'bubble-other'}`}>
                  <div className="message-content">{msg.content}</div>
                  <div className="message-time">
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-messages">
            No messages yet. Send a message to break the ice!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="chat-input-area">
        <input
          id="message-input"
          type="text"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button id="send-button" type="submit" className="btn btn-send" disabled={!inputText.trim()}>
          <Send size={18} />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
