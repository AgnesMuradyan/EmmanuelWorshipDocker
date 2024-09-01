import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './SongList.css';
import logo from './logo.png';

const SongList = () => {
  const [songs, setSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const songsPerPage = 15;

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

  const filteredSongs = songs
    .filter(song => song.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.title.localeCompare(b.title));  // Sort alphabetically

  const indexOfLastSong = currentPage * songsPerPage;
  const indexOfFirstSong = indexOfLastSong - songsPerPage;
  const currentSongs = filteredSongs.slice(indexOfFirstSong, indexOfLastSong);

  const totalPages = Math.ceil(filteredSongs.length / songsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

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
        <p className="no-songs-message">Երգերը բեռնվում են...</p>
      )}
      <ul className="song-list">
        {currentSongs.map(song => (
          <li key={song.id} className="song-item">
            <Link to={`/songs/${song.id}`} className="song-link">{song.title}</Link>
          </li>
        ))}
      </ul>
      <div className="pagination">
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={`page-button ${index + 1 === currentPage ? 'active' : ''}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SongList;
