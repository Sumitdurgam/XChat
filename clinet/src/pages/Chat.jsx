import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import SearchModal from '../components/SearchModal';

const Chat = () => {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(true);

  const fetchRooms = async () => {
    try {
      const res = await axios.get('/api/rooms/userrooms', { withCredentials: true });
      if (res.data && res.data.success) {
        setRooms(res.data.data);
        // If active room exists in fetched rooms, update reference
        if (activeRoom) {
          const updatedActive = res.data.data.find(r => r._id === activeRoom._id);
          if (updatedActive) setActiveRoom(updatedActive);
        }
      }
    } catch (err) {
      console.error("Error fetching rooms:", err);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSelectUserFromSearch = async (user) => {
    try {
      const res = await axios.post('/api/rooms/init', { otheruser: user._id }, { withCredentials: true });
      if (res.data && res.data.success) {
        const roomData = res.data.data;
        // Update rooms list if new
        setRooms((prevRooms) => {
          const exists = prevRooms.some((r) => r._id === roomData._id);
          if (exists) {
            return prevRooms.map((r) => (r._id === roomData._id ? roomData : r));
          }
          return [roomData, ...prevRooms];
        });
        setActiveRoom(roomData);
        setIsSearchOpen(false);
      }
    } catch (err) {
      console.error("Error initializing room:", err);
    }
  };

  return (
    <div id="chat-layout" className="chat-layout">
      <Sidebar
        rooms={rooms}
        activeRoom={activeRoom}
        onSelectRoom={(room) => setActiveRoom(room)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />
      <ChatWindow room={activeRoom} />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectUser={handleSelectUserFromSearch}
      />
    </div>
  );
};

export default Chat;
