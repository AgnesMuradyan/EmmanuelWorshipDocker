import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import './SongDetail.css';
import logo from './logo.png';

const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:8000'
  : 'https://emmanuel-worship-backend.onrender.com';

const SongDetail = () => {
  const { id } = useParams();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const chordsUrl = useMemo(() => `${API_BASE}/api/songs/${id}/view-chords/`, [id]);
  const pptUrl = useMemo(() => `${API_BASE}/api/songs/${id}/view-powerpoint/`, [id]);
  const detailUrl = useMemo(() => `${API_BASE}/api/songs/${id}/`, [id]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErrMsg('');
    axios
      .get(detailUrl)
      .then(res => { if (mounted) setSong(res.data); })
      .catch(() => { if (mounted) setErrMsg('Չհաջողվեց բեռնել երգի մանրամասները։'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [detailUrl]);

  const toggleMenu = () => setMenuOpen(v => !v);

  const downloadFile = async (url, filename, mime) => {
    try {
      const { data } = await axios.get(url, { responseType: 'blob' });
      const blob = new Blob([data], { type: mime });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(link.href), 0);
    } catch {
      alert('Ներբեռնումը չհաջողվեց։');
    }
  };

  const downloadChords = () =>
    downloadFile(chordsUrl, `${song?.title || 'song'}_chords.pdf`, 'application/pdf');

  const downloadPowerpoint = () =>
    downloadFile(
      pptUrl,
      `${song?.title || 'song'}_powerpoint.pptx`,
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    );

  const printSong = () => {
    if (!song) return;
    const printContent = `
      <div style="font-size:26px;font-weight:bold;text-align:center;margin-bottom:16px;font-family:'Noto Serif Armenian',serif;">
        ${song.title ?? ''}
      </div>
      <pre style="font-size:18px;line-height:1.5;white-space:pre-wrap;margin:0;font-family:ui-monospace,Menlo,Consolas,'Noto Sans Armenian',monospace;">
${song.verse ?? ''}
${song.structure ? `\n\nStructure:\n${song.structure}` : ''}
      </pre>`;
    const win = window.open('', '', 'width=900,height=700');
    if (!win) return;
    win.document.write(`<html><head><title>${song.title ?? 'Song'}</title></head><body>${printContent}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  const copyOriginalLink = async () => {
    if (!song?.original_link) return;
    try {
      await navigator.clipboard.writeText(song.original_link);
      // alert('Հղումը պատճենվեց․ ✅');
    } catch {
      alert('Չհաջողվեց պատճենել հղումը।');
    }
  };

  const hasChords = !!song?.chords;
  const albumTitle = song?.album?.title || song?.album_title;

  return (
    <div className="song-detail-shell">
      <div className="song-detail-container glass">
        <nav className="navbar">
          <div className="navbar-brand">
            <img src={logo} alt="EmmanuelWorship Logo" className="logo" />
            <span className="brand-name">EmmanuelWorship</span>
          </div>
          <div
            className="menu-icon"
            onClick={toggleMenu}
            aria-label="Բացնել մենյուն"
            role="button"
            tabIndex={0}
          >
            &#9776;
          </div>
          <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
            <Link to="/plans" className="nav-link" onClick={toggleMenu}>Ծրագրեր</Link>
            <Link to="/songs" className="nav-link" onClick={toggleMenu}>Երգեր</Link>
            <Link to="/create-slide" className="nav-link" onClick={toggleMenu}>Ստեղծել սլայդ</Link>
          </div>
        </nav>

        {loading && (
          <div className="card skeleton-card">
            <div className="sk-title"></div>
            <div className="sk-lines">
              <div className="sk-line w60"></div>
              <div className="sk-line w90"></div>
              <div className="sk-line w80"></div>
            </div>
          </div>
        )}

        {!loading && errMsg && (
          <div className="card error-card" role="alert">
            <div className="err-icon" aria-hidden>⚠️</div>
            <div>
              <h3>Օհ… խնդիր առաջացավ</h3>
              <p>{errMsg}</p>
            </div>
            <button className="btn" onClick={() => window.location.reload()}>Թարմացնել</button>
          </div>
        )}

        {!loading && !errMsg && song && (
          <>
            <header className="header-stack">
              <h1 className="song-title">{song.title}</h1>
              <div className="chip-row">
                {albumTitle && <span className="chip album-chip">{albumTitle}</span>}
              </div>
            </header>

            {song.verse && (
              <section className="section card verse-card">
                <pre className="song-verse">{song.verse}</pre>
              </section>
            )}

            {song.structure && (
              <section className="section card verse-card">
                <h2 className="section-title">Կառուցվածք</h2>
                <pre className="song-verse">{song.structure}</pre>
              </section>
            )}

            {(song.original_link && song.original_link.trim() !== '') && (
              <section className="section card meta-card">
                <div className="link-row">
                  <a
                    href={song.original_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="external-link"
                  >
                    Բացնել հղումը (YouTube) →
                  </a>
                  <button className="btn btn-secondary" onClick={copyOriginalLink}>
                    Պատճենել
                  </button>
                </div>
              </section>
            )}

            {/* НОՏԱՆԵՐ section with bigger title and buttons below it */}
            <section className="section card chords-card">
              <h2 className="section-title section-title-big">Նոտաներ</h2>

              <div className="chords-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => window.open(chordsUrl, '_blank', 'noopener,noreferrer')}
                  disabled={!hasChords}
                >
                  Ընդարձակել
                </button>

                <button className="btn" onClick={downloadChords} disabled={!hasChords}>
                  Ներբեռնել Նոտաները
                </button>
              </div>

              {hasChords ? (
                <div className="chords-container">
                  <iframe src={chordsUrl} className="chords-iframe" title="Chords" frameBorder="0" />
                </div>
              ) : (
                <div className="empty">
                  <div className="empty-illustration" aria-hidden>📄</div>
                  <p>Նոտաները հասանելի չեն։</p>
                </div>
              )}
            </section>

            {/* Actions: first row with two buttons, second row with back link */}
            <section className="section card actions-card">
              <div className="actions-row-top">
                <button className="btn" onClick={downloadPowerpoint}>Ներբեռնել սլայդը</button>
                <button className="btn btn-outline" onClick={printSong}>Տպել երգը</button>
              </div>
              <div className="actions-row-bottom">
                <Link to="/songs" className="btn btn-ghost">Վերադառնալ երգացանկ</Link>
              </div>
            </section>

            {/*<section className="section card dates-card">*/}
            {/*  <div className="dates-grid">*/}
            {/*    {song.created_at && (*/}
            {/*      <div className="date-item">*/}
            {/*        <span className="date-label">Ստեղծվել է</span>*/}
            {/*        <span className="date-value">{new Date(song.created_at).toLocaleDateString()}</span>*/}
            {/*      </div>*/}
            {/*    )}*/}
            {/*    {song.updated_at && (*/}
            {/*      <div className="date-item">*/}
            {/*        <span className="date-label">Փոփոխվել է</span>*/}
            {/*        <span className="date-value">{new Date(song.updated_at).toLocaleDateString()}</span>*/}
            {/*      </div>*/}
            {/*    )}*/}
            {/*  </div>*/}
            {/*</section>*/}
          </>
        )}
      </div>
    </div>
  );
};

export default SongDetail;
