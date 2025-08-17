import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './SongList.css';
import logo from './logo.png';
import Pagination from './Pagination';

const SongList = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const songsPerPage = 15;

  useEffect(() => {
    axios.get('https://emmanuel-worship-backend.onrender.com/api/songs/')
      .then(response => {
        setSongs(response.data || []);
      })
      .catch(error => console.error('There was an error fetching the songs!', error))
      .finally(() => setLoading(false));
  }, []);

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSearch = (event) => setSearchTerm(event.target.value);
  const toggleMenu = () => setMenuOpen(o => !o);

  const filteredSongs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const base = term
      ? songs.filter(song => (song.title || '').toLowerCase().includes(term))
      : songs;
    return [...base].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  }, [songs, searchTerm]);

  const totalPages = Math.ceil(filteredSongs.length / songsPerPage) || 1;
  const indexOfLastSong = Math.min(currentPage * songsPerPage, filteredSongs.length);
  const indexOfFirstSong = Math.min((currentPage - 1) * songsPerPage + 1, filteredSongs.length || 1);
  const currentSongs = filteredSongs.slice((currentPage - 1) * songsPerPage, currentPage * songsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // smooth scroll to top of list on change
    const container = document.querySelector('.song-list-container');
    if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="song-list-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <img src={logo} alt="EmmanuelWorship Logo" className="logo" />
          <span className="brand-name">EmmanuelWorship</span>
        </div>
        <div className="menu-icon" onClick={toggleMenu} role="button" aria-label="Toggle menu">
          &#9776;
        </div>
        <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <Link to="/plans" className="nav-link" onClick={toggleMenu}>Ծրագրեր</Link>
          <Link to="/songs" className="nav-link" onClick={toggleMenu}>Երգեր</Link>
        </div>
      </nav>

      <h1 className="title">Երգացանկ</h1>

      <div className="song-toolbar">
        <input
          type="text"
          placeholder="Ներածե'ք վերնագիրը"
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        <div className="results-meta" aria-live="polite">
          {loading
            ? "Բեռնվում է…"
            : filteredSongs.length > 0
              ? `${indexOfFirstSong}–${indexOfLastSong} / ${filteredSongs.length}`
              : "Արդյունքներ չկան"}
        </div>
      </div>

      {loading && (
        <p className="no-songs-message">Երգերը բեռնվում են...</p>
      )}

      {!loading && filteredSongs.length === 0 && (
        <p className="no-songs-message">Չկան համապատասխան երգեր</p>
      )}

      <ul className="song-list">
        {currentSongs.map(song => (
          <li key={song.id} className="song-item">
            <Link to={`/songs/${song.id}`} className="song-link">{song.title}</Link>
          </li>
        ))}
      </ul>

      {/* Pretty, compact, accessible pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        siblingCount={1}     // tweak for wider middle window
        boundaryCount={1}    // show 1 page at each edge
      />
    </div>
  );
};

export default SongList;
