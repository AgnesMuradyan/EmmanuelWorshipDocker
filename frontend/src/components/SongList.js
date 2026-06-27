// src/components/SongList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './SongList.css';
import logo from './logo.png';
import Pagination from './Pagination';
import { API_BASE_URL } from '../config/api';

const PAGE_SIZE = 15;
const SONGS_CHOICES_URL = `${API_BASE_URL}/api/songs/choices/`;

const SongList = () => {
  const [songs, setSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const totalPages = Math.ceil(count / PAGE_SIZE);

  const fetchPage = async (page, term) => {
    try {
      setLoading(true);
      setErrMsg('');
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
      setErrMsg('Չհաջողվեց բեռնել երգերի ցուցակը։ Խնդրում ենք փորձել λίγο հետո։');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPage(1, ''); }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => fetchPage(1, searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber !== currentPage) fetchPage(pageNumber, searchTerm);
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className="page-bg">
      {/* Subtle gradient + dots */}
      <svg className="bg-pattern" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--c-grad-1)" />
            <stop offset="100%" stopColor="var(--c-grad-2)" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100" height="100" fill="url(#g1)" />
        <g opacity="0.08">
          <circle cx="18" cy="18" r="8" />
          <circle cx="78" cy="28" r="10" />
          <circle cx="64" cy="84" r="12" />
        </g>
      </svg>

      <div className="song-list-container glass">
        <nav className="navbar">
          <div className="navbar-brand">
            <img src={logo} alt="EmmanuelWorship Logo" className="logo" />
            <span className="brand-name">EmmanuelWorship</span>
          </div>
          <div className="menu-icon" onClick={toggleMenu} aria-label="Բացնել մենյուն" role="button" tabIndex={0}>
            &#9776;
          </div>
          <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
            <Link to="/plans" className="nav-link" onClick={toggleMenu}>Ծրագրեր</Link>
            <Link to="/songs" className="nav-link" onClick={toggleMenu}>Երգեր</Link>
            <Link to="/create-slide" className="nav-link" onClick={toggleMenu}>Ստեղծել սլայդ</Link>
          </div>
        </nav>

        <header className="header-stack">
          <h1 className="song-title">Երգացանկ</h1>
          {searchTerm && (
            <div className="chip-row">
              <span className="chip chip-muted">Փնտրվում է՝ “{searchTerm}”</span>
            </div>
          )}
        </header>

        {/* Sticky search */}
        <div className="controls sticky-controls" role="search">
          <div className="control-grid">
            <div className="input-wrap">
              <label htmlFor="songSearch" className="sr-only">Փնտրել ըստ վերնագրի</label>
              <input
                id="songSearch"
                type="text"
                placeholder="Ներածե՛ք վերնագիրը"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        {/* ✅ Pagination directly under search controls */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            siblingCount={1}
            boundaryCount={1}
            compactOnMobile={true}
            mobileBreakpoint={520}
            mobileSiblingCount={0}
            mobileBoundaryCount={1}
            size="md"
            showTotal
          />
        )}

        {/* Error */}
        {errMsg && (
          <div className="card error-card" role="alert">
            <div className="err-icon" aria-hidden>⚠️</div>
            <div>
              <h3>Օհ… խնդիր առաջացավ</h3>
              <p>{errMsg}</p>
            </div>
            <button className="btn" onClick={() => fetchPage(currentPage, searchTerm)}>Կրկնեցնել</button>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && !errMsg && (
          <ul className="song-list">
            {Array.from({ length: 8 }).map((_, i) => (
              <li key={i} className="song-item">
                <div className="song-card skeleton">
                  <div className="sk-avatar"></div>
                  <div className="sk-lines">
                    <div className="sk-line sk-line-1"></div>
                    <div className="sk-line sk-line-2"></div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Content */}
        {!loading && !errMsg && (
          <>
            {songs.length === 0 ? (
              <div className="empty">
                <div className="empty-illustration" aria-hidden>🎵</div>
                <h3>Արդյունքներ չկան</h3>
                <p>Փորձեք փոխել որոնման բառերը։</p>
              </div>
            ) : (
              <ul className="song-list">
                {songs.map((song) => {
                  const letter = (song.title || '?').trim().charAt(0).toUpperCase();
                  return (
                    <li key={song.id} className="song-item">
                      <Link to={`/songs/${song.id}`} className="song-card">
                        <div className="note-avatar" aria-hidden>
                          <span className="note">{letter}</span>
                        </div>
                        <div className="song-main">
                          <div className="song-title-line">{song.title}</div>
                          <div className="meta-row">
                            {song.original_key && <span className="meta-chip key-chip">Սր՝ {song.original_key}</span>}
                            {song.album_title && <span className="meta-chip album-chip">{song.album_title}</span>}
                            <span className="meta-link">Բացել երգը →</span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SongList;
