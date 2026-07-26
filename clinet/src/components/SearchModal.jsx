import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, X } from 'lucide-react';

const SearchModal = ({ isOpen, onClose, onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleSearch = async () => {
      if (!searchTerm.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await axios.get(`/api/users/search?searchTerm=${encodeURIComponent(searchTerm)}`, {
          withCredentials: true,
        });
        if (res.data && res.data.success) {
          setResults(res.data.data);
        }
      } catch (err) {
        console.error("User search error:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Search Users</h3>
          <button id="close-search" className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            id="search-input"
            type="text"
            placeholder="Type username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        <div className="search-results">
          {loading ? (
            <div className="searching-indicator">Searching users...</div>
          ) : results.length > 0 ? (
            results.map((u) => (
              <div
                key={u._id}
                id={`user-result-${u._id}`}
                className="user-result-card"
                onClick={() => onSelectUser(u)}
              >
                <img src={u.avatar} alt={u.fullName} className="avatar-sm" />
                <div className="user-details">
                  <div className="user-name">{u.fullName}</div>
                  <div className="user-sub">@{u.username} • {u.email}</div>
                </div>
              </div>
            ))
          ) : searchTerm.trim() !== '' ? (
            <div className="no-results">No users found matching "{searchTerm}"</div>
          ) : (
            <div className="search-prompt">Type above to search for users to start chatting</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
