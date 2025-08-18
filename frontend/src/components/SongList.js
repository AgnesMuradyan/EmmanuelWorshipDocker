import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './SongList.css';
import logo from './logo.png';
import Pagination from './Pagination';
import API_BASE from '../apiBase';

const PAGE_SIZE = 15;

// 👇 Use the compact selector endpoint
const SONGS_CHOICES_URL = `${API_BASE}/api/songs/choices/`;

const SongList = () => {
  const [songs, setSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const totalPages = Math.ceil(count / PAGE_SIZE);

  const fetchPage = async (page, term) => {
    setLoading(true);
    try {
      const { data } = await axios.get(SONGS_CHOICES_URL, {
        params: {
          page,
          page_size: PAGE_SIZE,
          search: term || '',
          ordering: 'title',
        },
      });
      setSongs(data.results || []);
      setCount(data.count || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error('There was an error fetching the songs!', err);
      setSongs([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(1, '');
  }, []);

  // Debounce search by 300ms
  useEffect(() => {
    const t = setTimeout(() => fetchPage(1, searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber !== currentPage) fetchPage(pageNumber, searchTerm);
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

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
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      {loading && <p className="no-songs-message">Երգերը բեռնվում են...</p>}
      {!loading && songs.length === 0 && <p className="no-songs-message">Չկան արդյունքներ</p>}

      <ul className="song-list">
        {songs.map(song => (
          <li key={song.id} className="song-item">
            <Link to={`/songs/${song.id}`} className="song-link">{song.title}</Link>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages || 1}
          onPageChange={handlePageChange}
          siblingCount={1}
          boundaryCount={1}
        />
      )}
    </div>
  );
};

export default SongList;
