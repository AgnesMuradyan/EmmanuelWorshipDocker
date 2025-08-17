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
    const fetchAll = async () => {
      try {
        let url = 'https://emmanuel-worship-backend.onrender.com/api/songs/';
        const all = [];
        while (url) {
          const { data } = await axios.get(url);
          const chunk = Array.isArray(data) ? data : (data?.results ?? []);
          all.push(...chunk);
          url = data?.next ?? null; // follow DRF pagination if present
        }
        setSongs(all);
      } catch (error) {
        console.error('There was an error fetching the songs!', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSearch = (event) => setSearchTerm(event.target.value);
  const toggleMenu = () => setMenuOpen(o => !o);

  const filteredSongs = useMemo(() => {
    const term = (searchTerm || '').trim().toLowerCase();
    const source = Array.isArray(songs) ? songs : [];
    const base = term
      ? source.filter(song => (song?.title ?? '').toLowerCase().includes(term))
      : source;
    return base.slice().sort((a, b) => (a?.title ?? '').localeCompare(b?.title ?? ''));
  }, [songs, searchTerm]);

  const totalPages = Math.ceil(filteredSongs.length / songsPerPage) || 1;
  const indexOfLastSong = Math.min(currentPage * songsPerPage, filteredSongs.length);
  const indexOfFirstSong = Math.min((currentPage - 1) * songsPerPage + 1, filteredSongs.length || 1);
  const currentSongs = filteredSongs.slice((currentPage - 1) * songsPerPage, currentPage * songsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
        siblingCount={1}
        boundaryCount={1}
      />
    </div>
  );
};

export default SongList;
