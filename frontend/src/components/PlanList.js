// src/components/PlanList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './PlanList.css';
import logo from './logo.png';
import Pagination from './Pagination';
import { API_BASE_URL } from '../config/api';

const PLANS_CHOICES_URL = `${API_BASE_URL}/api/plans/choices/`;

const monthNames = [
  'Հունվար','Փետրվար','Մարտ','Ապրիլ','Մայիս','Հունիս',
  'Հուլիս','Օգոստոս','Սեպտեմբեր','Հոկտեմբեր','Նոյեմբեր','Դեկտեմբեր'
];
const weekdayNames = ['Կիր','Երկ','Երք','Չրք','Հնգ','Ուր','Շբթ'];

const formatDateLong = (dateString) => {
  const d = new Date(dateString);
  const day = d.getDate();
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  const weekday = weekdayNames[d.getDay()];
  return `${weekday} • ${day} ${month}, ${year}`;
};

const dayTypeLabel = (code) => {
  if (code === 'SU') return 'Կիրակի';
  if (code === 'TH') return 'Հինգշաբթի';
  if (code === 'OT') return 'Այլ';
  return 'Բոլորը';
};

const PlanList = () => {
  const [plans, setPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // YYYY-MM-DD
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDayType, setSelectedDayType] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const plansPerPage = 15;
  const [count, setCount] = useState(0);
  const totalPages = Math.ceil(count / plansPerPage);

  // ui states
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchPage(1), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  useEffect(() => {
    fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDayType]);

  const fetchPage = async (page) => {
    try {
      setLoading(true);
      setErrMsg('');
      const params = { page, page_size: plansPerPage, ordering: '-date' };
      if (searchTerm) params.date = searchTerm;
      if (selectedDayType !== 'ALL') params.day_type = selectedDayType;

      const { data } = await axios.get(PLANS_CHOICES_URL, { params });
      setPlans(data.results || []);
      setCount(data.count || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('There was an error fetching the plans!', error);
      setErrMsg('Չհաջողվեց բեռնել ծրագրերը։ Խնդրում ենք փորձել մի քիչ հետո։');
      setPlans([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber !== currentPage) fetchPage(pageNumber);
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className="page-bg">
      {/* subtle svg pattern */}
      <svg className="bg-pattern" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--c-grad-1)" />
            <stop offset="100%" stopColor="var(--c-grad-2)" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100" height="100" fill="url(#g1)" />
        <g opacity="0.08">
          <circle cx="20" cy="20" r="10" />
          <circle cx="80" cy="30" r="8" />
          <circle cx="60" cy="80" r="12" />
        </g>
      </svg>

      <div className="plan-list-container glass">
        <nav className="navbar">
          <div className="navbar-brand">
            <img src={logo} alt="EmmanuelWorship" className="logo" />
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

        <header className="header-stack">
          <h1 className="song-title">Ծրագրեր</h1>
          {/*<div className="chip-row">
            <span className={`chip chip-type-${selectedDayType.toLowerCase()}`}>{headerChip}</span>
            {searchTerm && <span className="chip chip-muted">Ամսաթիվ՝ {searchTerm}</span>}
          </div>*/}
        </header>

        {/* Filters */}
        <div className="controls sticky-controls" role="search">
          <div className="control-grid">
            <div className="input-wrap">
              <label htmlFor="dateInput" className="sr-only">Փնտրել ըստ ամսաթվի</label>
              <input
                id="dateInput"
                type="date"
                placeholder="Search by date"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filters" role="radiogroup" aria-label="Օրվա տեսակ">
              {['ALL','SU','TH','OT'].map((v) => (
                <label key={v}>
                  <input
                    type="radio"
                    name="dayType"
                    value={v}
                    checked={selectedDayType === v}
                    onChange={(e) => setSelectedDayType(e.target.value)}
                  />
                  <span>{dayTypeLabel(v)}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ✅ Pagination placed directly under filters */}
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

        {/* Error */}
        {errMsg && (
          <div className="card error-card" role="alert">
            <div className="err-icon" aria-hidden>⚠️</div>
            <div>
              <h3>Օհ… խնդիր առաջացավ</h3>
              <p>{errMsg}</p>
            </div>
            <button className="btn" onClick={() => fetchPage(currentPage)}>Կրկնեցնել</button>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && !errMsg && (
          <ul className="plan-list">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="plan-item">
                <div className="plan-card skeleton">
                  <div className="sk-date"></div>
                  <div className="sk-line"></div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Content */}
        {!loading && !errMsg && (
          <>
            {plans.length === 0 ? (
              <div className="empty">
                <div className="empty-illustration" aria-hidden>📅</div>
                <h3>Առայժմ արդյունքներ չկան</h3>
                <p>Փորձեք փոխել ֆիլտրերը կամ ամսաթիվը։</p>
              </div>
            ) : (
              <ul className="plan-list">
                {plans.map((plan) => {
                  const d = new Date(plan.date);
                  const dayNum = d.getDate();
                  const monthShort = monthNames[d.getMonth()].slice(0, 3);
                  const long = formatDateLong(plan.date);
                  const type = (plan.day_type || '').toLowerCase();
                  return (
                    <li key={plan.id} className="plan-item">
                      <Link to={`/plans/${plan.id}`} className="plan-card">
                        <div className="date-badge">
                          <span className="day">{dayNum}</span>
                          <span className="mon">{monthShort}</span>
                        </div>
                        <div className="plan-main">
                          <div className="plan-title">{long}</div>
                          <div className="meta-row">
                            <span className={`meta-chip type-${type || 'all'}`}>
                              {dayTypeLabel(plan.day_type || 'ALL')}
                            </span>
                            <span className="meta-link">Դիտել պլանը →</span>
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

export default PlanList;
