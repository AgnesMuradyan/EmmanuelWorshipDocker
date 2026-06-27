import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './PlanDetail.css';
import logo from './logo.png';
import { API_BASE_URL } from '../config/api';

const monthNames = [
  'Հունվար','Փետրվար','Մարտ','Ապրիլ','Մայիս','Հունիս',
  'Հուլիս','Օգոստոս','Սեպտեմբեր','Հոկտեմբեր','Նոյեմբեր','Դեկտեմբեր'
];
const weekdayNames = ['Կիր','Երկ','Երք','Չրք','Հնգ','Ուր','Շբթ'];

const formatDateLong = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${weekdayNames[d.getDay()]} • ${d.getDate()} ${monthNames[d.getMonth()]}, ${d.getFullYear()}`;
};

const PlanDetail = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const planUrl = useMemo(() => `${API_BASE_URL}/api/plans/${id}/`, [id]);
  const downloadPptUrl = useMemo(
    () => `${API_BASE_URL}/api/plans/${id}/download-concatenated-powerpoint/`,
    [id]
  );
  const downloadDocxUrl = useMemo(
    () => `${API_BASE_URL}/api/plans/${id}/download-summary-docx/`,
    [id]
  );

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErrMsg('');
    axios.get(planUrl)
      .then((res) => { if (mounted) setPlan(res.data); })
      .catch((e) => { console.error(e); if (mounted) setErrMsg('Չհաջողվեց բեռնել ծրագրի մանրամասները։'); })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [planUrl]);

  const toggleMenu = () => setMenuOpen((m) => !m);

  const downloadBlob = async (url, filename, mime) => {
    try {
      const { data } = await axios.get(url, { responseType: 'blob' });
      const blob = new Blob([data], { type: mime });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 0);
    } catch (e) {
      console.error(e);
      alert('Ներբեռնումը չհաջողվեց։');
    }
  };

  const downloadConcatenatedPowerpoint = () => {
    const datePart = plan?.date || 'plan';
    downloadBlob(
      downloadPptUrl,
      `Plan_${datePart}_concatenated_powerpoint.pptx`,
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    );
  };

  const downloadSummaryDocx = () => {
    const datePart = plan?.date || 'plan';
    downloadBlob(
      downloadDocxUrl,
      `Plan_${datePart}_summary.docx`,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
  };

  // ---- Derived, ordered sections
  const orderedLeadSingers = useMemo(() => {
    const arr = plan?.lead_singers_ordered ?? [];
    return arr.slice().sort((a, b) => a.order - b.order);
  }, [plan?.lead_singers_ordered]);

  const sortedSongs = useMemo(() => {
    const arr = plan?.songs ?? [];
    return arr.slice().sort((a, b) => a.order - b.order);
  }, [plan?.songs]);

  const singers = plan?.singers ?? [];
  const choir = plan?.choir ?? [];
  const musicians = plan?.musicians ?? [];

  const dayTypeChip = (() => {
    const t = plan?.day_type;
    if (!t) return 'Օրվա տեսակ՝ (անհայտ)';
    if (t === 'SU') return 'Կիրակի';
    if (t === 'TH') return 'Հինգշաբթի';
    if (t === 'OT') return 'Այլ';
    return t;
  })();

  const avatar = (first, last) => {
    const f = (first || '').trim().charAt(0).toUpperCase();
    const l = (last || '').trim().charAt(0).toUpperCase();
    return (f || '?') + (l || '');
  };

  return (
    <div className="page-bg">
      {/* gradient + subtle dots */}
      <svg className="bg-pattern" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--c-grad-1)" />
            <stop offset="100%" stopColor="var(--c-grad-2)" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100" height="100" fill="url(#g1)" />
        <g opacity="0.08">
          <circle cx="18" cy="22" r="10" />
          <circle cx="80" cy="28" r="8" />
          <circle cx="64" cy="84" r="12" />
        </g>
      </svg>

      <div className="plan-detail-container glass">
        <nav className="navbar">
          <div className="navbar-brand">
            <img src={logo} alt="EmmanuelWorship Logo" className="logo" />
            <span className="brand-name">EmmanuelWorship</span>
          </div>
          <div className="menu-icon" onClick={toggleMenu} aria-label="Բացել մենյուն" role="button" tabIndex={0}>
            &#9776;
          </div>
          <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
            <Link to="/plans" className="nav-link" onClick={toggleMenu}>Ծրագրեր</Link>
            <Link to="/songs" className="nav-link" onClick={toggleMenu}>Երգեր</Link>
            <Link to="/create-slide" className="nav-link" onClick={toggleMenu}>Ստեղծել սլայդ</Link>
          </div>
        </nav>

        {/* Loading Skeleton */}
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

        {/* Error */}
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

        {/* Content */}
        {!loading && !errMsg && plan && (
          <>
            <header className="header-stack">
              <h1 className="plan-date">{formatDateLong(plan.date)}</h1>
              <div className="chip-row">
                <span className="chip chip-type">{dayTypeChip}</span>
                {/*<span className="chip muted">ID՝ {plan.id}</span>*/}
              </div>
            </header>

            {/* Leaders */}
            <section className="section card">
              <div className="section-title-row">
                <h2 className="section-title">Վարողներ</h2>
              </div>
              {orderedLeadSingers.length === 0 ? (
                <div className="empty"><div className="empty-illustration">👤</div>Չկան վարողներ</div>
              ) : (
                <ul className="people-list">
                  {orderedLeadSingers.map((p) => (
                    <li key={p.id} className="person">
                      <div className="avatar">{avatar(p.first_name, p.last_name)}</div>
                      <div className="person-main">
                        <div className="person-name">{p.first_name} {p.last_name}</div>
                        <div className="person-sub">{p.order}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Vocals */}
            <section className="section card">
              <div className="section-title-row">
                <h2 className="section-title">Վոկալ</h2>
              </div>
              {singers.length === 0 ? (
                <div className="empty"><div className="empty-illustration">🎤</div>Չկան...</div>
              ) : (
                <ul className="people-grid">
                  {singers.map((s) => (
                    <li key={s.id} className="person-tile">
                      <div className="avatar sm">{avatar(s.first_name, s.last_name)}</div>
                      <div className="tile-name">{s.first_name} {s.last_name}</div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Choir */}
            <section className="section card">
              <div className="section-title-row">
                <h2 className="section-title">Երգչախումբ</h2>
              </div>
              {choir.length === 0 ? (
                <div className="empty"><div className="empty-illustration">🎶</div>Չկան...</div>
              ) : (
                <ul className="people-grid">
                  {choir.map((s) => (
                    <li key={s.id} className="person-tile">
                      <div className="avatar sm">{avatar(s.first_name, s.last_name)}</div>
                      <div className="tile-name">{s.first_name} {s.last_name}</div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Musicians */}
            <section className="section card">
              <div className="section-title-row">
                <h2 className="section-title">Երաժիշտներ</h2>
              </div>
              {musicians.length === 0 ? (
                <div className="empty"><div className="empty-illustration">🎸</div>Չկան...</div>
              ) : (
                <ul className="people-grid">
                  {musicians.map((m) => (
                    <li key={m.id} className="person-tile">
                      <div className="avatar sm">{avatar(m.first_name, m.last_name)}</div>
                      <div className="tile-name">{m.first_name} {m.last_name}</div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Songs (ordered) */}
            <section className="section card">
              <div className="section-title-row">
                <h2 className="section-title">Երգեր</h2>
              </div>
              {sortedSongs.length === 0 ? (
                <div className="empty"><div className="empty-illustration">🎵</div>Չկան երգեր</div>
              ) : (
                <ol className="song-ordered">
                  {sortedSongs.map((ps) => (
                    <li key={ps.id} className="song-row">
                      <div className="song-order">{ps.order}</div>
                      <div className="song-main">
                        <Link to={`/songs/${ps.song_id}`} className="song-link">
                          {ps.song_title}
                        </Link>
                        <div className="song-sub">
                          {ps.original_key && <span className="meta-chip key">Տոն՝ {ps.original_key}</span>}
                          {ps.album_title && <span className="meta-chip album">{ps.album_title}</span>}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            {/* Actions */}
            <section className="section actions-card">
              <div className="actions-row-top">
                <button className="btn" onClick={downloadConcatenatedPowerpoint}>
                  Ներբեռնել միակցված սլայդը
                </button>
                <button className="btn btn-outline" onClick={downloadSummaryDocx}>
                  Ներբեռնել ծրագիրը (DOCX)
                </button>
              </div>
              <div className="actions-row-bottom">
                <Link to="/plans" className="btn btn-ghost">Վերադառնալ ծրագրեր</Link>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default PlanDetail;
