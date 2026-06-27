// src/components/CreateSlide.jsx
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './SongList.css';
import logo from './logo.png';
import { API_BASE_URL } from '../config/api';

const CREATE_SLIDE_URL = `${API_BASE_URL}/api/create_slide_dl/`;
const MAX_TEXT_LEN = 15000;           // keep headroom for URL length
const SAFE_URL_LEN = 8000;            // warn if the final URL might exceed common limits

export default function CreateSlide() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [text, setText] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [okMsg, setOkMsg] = useState('');

  const stats = useMemo(() => {
    const lines = text.replace(/\r\n/g, '\n').split('\n').filter(l => l.trim());
    return { lines: lines.length, slides: Math.max(1, Math.ceil(lines.length / 2)) };
  }, [text]);

  const doDownload = (e) => {
    e.preventDefault();
    setErrMsg('');
    setOkMsg('');

    const q = new URLSearchParams({ text }).toString();   // safely encodes newlines etc.
    const url = `${CREATE_SLIDE_URL}?${q}`;

    if (url.length > SAFE_URL_LEN) {
      setErrMsg('Տեքստը շատ երկար է GET դիմումի համար։ Խնդրում ենք կրճատել տեքստը կամ բաժանել մի քանի մասի։');
      return;
    }

    // Navigate to the URL -> browser downloads the PPTX (no CORS/CSRF/cookies)
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.setAttribute('download', 'slides.pptx'); // hint; server sets real name
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    setOkMsg('Ներբեռնումը սկսվեց ✅');
  };

  return (
    <div className="page-bg">
      {/* background */}
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
        {/* Navbar like SongList */}
        <nav className="navbar">
          <div className="navbar-brand">
            <img src={logo} alt="EmmanuelWorship Logo" className="logo" />
            <span className="brand-name">EmmanuelWorship</span>
          </div>
          <div
            className="menu-icon"
            onClick={() => setMenuOpen(m => !m)}
            aria-label="Բացնել մենյուն"
            role="button"
            tabIndex={0}
          >
            &#9776;
          </div>
          <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
            <Link to="/plans" className="nav-link" onClick={() => setMenuOpen(false)}>Ծրագրեր</Link>
            <Link to="/songs" className="nav-link" onClick={() => setMenuOpen(false)}>Երգեր</Link>
            <Link to="/create-slide" className="nav-link nav-link-primary" onClick={() => setMenuOpen(false)}>Ստեղծել սլայդ</Link>
          </div>
        </nav>

        {/* Header */}
        <header className="header-stack">
          <h1 className="song-title">Ստեղծել սլայդ</h1>
          <div className="chip-row">
            <span className="chip chip-muted">Տողեր՝ {stats.lines}</span>
            <span className="chip chip-muted">Սլայդներ՝ {stats.slides}</span>
          </div>
        </header>

        {/* Form */}
        <form onSubmit={doDownload}>
          <div className="controls sticky-controls" role="search">
            <div className="control-grid">
              <div className="input-wrap" style={{ width: '100%' }}>
                <label htmlFor="slideText" className="sr-only">Տեքստ</label>
                <textarea
                  id="slideText"
                  className="search-input"
                  style={{ minHeight: 260, padding: 12, lineHeight: 1.5, resize: 'vertical', fontSize: 16, fontFamily: 'inherit' }}
                  placeholder="Յուրաքանչյուր տող առանձին...\nՕրինակ՝\nՏող 1\nՏող 2\nՏող 3"
                  maxLength={MAX_TEXT_LEN}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="chip-row" style={{ marginTop: 8, justifyContent: 'space-between' }}>
                  <span className="chip chip-muted">{text.length} / {MAX_TEXT_LEN}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="controls" style={{ marginTop: 10 }}>
            <button type="submit" className="btn" disabled={!text.trim()} style={{ marginRight: 10 }}>
              Ստեղծել և ներբեռնել PPTX
            </button>
            <button
              type="button"
              className="btn outline"
              onClick={() => { setText(''); setOkMsg(''); setErrMsg(''); }}
              disabled={!text}
            >
              Մաքրել
            </button>
          </div>
        </form>

        {/* Messages */}
        {errMsg && (
          <div className="card error-card" role="alert" style={{ marginTop: 16 }}>
            <div className="err-icon" aria-hidden>⚠️</div>
            <div>
              <h3>Օհ… խնդիր առաջացավ</h3>
              <p>{errMsg}</p>
            </div>
          </div>
        )}
        {okMsg && (
          <div className="chip-row" style={{ marginTop: 16 }}>
            <span className="chip">{okMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
