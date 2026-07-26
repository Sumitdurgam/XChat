import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Plus, MessageSquare } from 'lucide-react';

const Sidebar = ({ rooms, activeRoom, onSelectRoom, onOpenSearch }) => {
  const { user, logout } = useAuth();

  const getOtherUser = (room) => {
    if (!room || !room.users || !user) return null;
    return room.users.find((u) => u._id !== user._id) || room.users[0];
  };

  return (
    <div className="sidebar">
      {/* Sidebar Header with User Profile */}
      <div className="sidebar-header">
        <div className="user-profile">
          <img
            src={user?.avatar || `https://avatar.iran.liara.run/username?username=${user?.fullName || 'User'}`}
            alt={user?.fullName || 'User'}
            className="avatar"
          />
          <div className="user-info">
            <h3 id="user-name">{user?.fullName}</h3>
            <p id="user-username">@{user?.username}</p>
          </div>
        </div>
        <div className="sidebar-actions">
          <button
            id="new-chat-button"
            className="icon-btn"
            title="Start New Chat"
            onClick={onOpenSearch}
          >
            <Plus size={20} />
          </button>
          <button
            id="logout-button"
            className="icon-btn logout-btn"
            title="Logout"
            onClick={logout}
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Chat Rooms List */}
      <div className="rooms-section">
        <div className="section-title">
          <span>Recent Conversations</span>
        </div>
        <div className="rooms-list" id="chat-rooms-list">
          {rooms && rooms.length > 0 ? (
            rooms.map((room) => {
              const other = getOtherUser(room);
              const isActive = activeRoom && activeRoom._id === room._id;
              return (
                <button
                  key={room._id}
                  id={`room-${room._id}`}
                  className={`room-item ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectRoom(room)}
                >
                  <img
                    src={other?.avatar || `https://avatar.iran.liara.run/username?username=${other?.fullName || 'User'}`}
                    alt={other?.fullName || 'Chat'}
                    className="avatar-sm"
                  />
                  <div className="room-info">
                    <div className="room-name">{other?.fullName || 'User'}</div>
                    <div className="room-sub">@{other?.username || ''}</div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="empty-rooms">
              <MessageSquare size={32} />
              <p>No conversations yet.</p>
              <button onClick={onOpenSearch} className="btn-link">
                Start a new chat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
