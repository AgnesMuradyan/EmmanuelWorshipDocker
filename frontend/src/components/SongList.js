import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './SongList.css';
import logo from './logo.png';

const SongList = () => {
  const [songs, setSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    axios.get('https://emmanuel-worship-backend.onrender.com/api/songs/')
      .then(response => {
        console.log('API response:', response.data);  // Debugging line
        setSongs(response.data);
      })
      .catch(error => console.error('There was an error fetching the songs!', error));
  }, []);

  const handleSearch = event => {
    setSearchTerm(event.target.value);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const filteredSongs = songs
    .filter(song => song.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.title.localeCompare(b.title));  // Sort alphabetically

  return (
    <div className="song-list-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <img src={logo} alt="EmmanuelWorship Logo" className="logo" />
          <span className="brand-name">EmmanuelWorship</span>
        </div>
        <div className="menu-icon" onClick={toggleMenu}>
          &#9776;
        </div>
        <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <Link to="/plans" className="nav-link" onClick={toggleMenu}>Ծրագրեր</Link>
          <Link to="/songs" className="nav-link" onClick={toggleMenu}>Երգեր</Link>
        </div>
      </nav>
      <h1 className="title">Երգացանկ</h1>
      <input
        type="text"
        placeholder="Ներածե'ք վերնագիրը"
        value={searchTerm}
        onChange={handleSearch}
        className="search-input"
      />
      {filteredSongs.length === 0 && (
        <p className="no-songs-message">No songs found.</p>
      )} {/* Display message if no songs found */}
      <ul className="song-list">
        {filteredSongs.map(song => (
          <li key={song.id} className="song-item">
            <Link to={`/songs/${song.id}`} className="song-link">{song.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SongList;
