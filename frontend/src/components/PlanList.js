import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './PlanList.css';
import logo from './logo.png';
import Pagination from './Pagination';

const PLANS_CHOICES_URL = 'https://emmanuel-worship-backend.onrender.com/api/plans/choices/';

const PlanList = () => {
  const [plans, setPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // YYYY-MM-DD
  const [menuOpen, setMenuOpen] = useState(false);

  // single-select day type: 'ALL' | 'SU' | 'TH' | 'OT'
  const [selectedDayType, setSelectedDayType] = useState('ALL');

  // server-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const plansPerPage = 15;
  const [count, setCount] = useState(0);
  const totalPages = Math.ceil(count / plansPerPage);

  useEffect(() => {
    fetchPage(1);
  }, []);

  // refetch when search term changes (debounced)
  useEffect(() => {
    const t = setTimeout(() => fetchPage(1), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // refetch when selected day type changes
  useEffect(() => {
    fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDayType]);

  const fetchPage = async (page) => {
    try {
      const params = {
        page,
        page_size: plansPerPage,
        ordering: '-date',
      };

      if (searchTerm) params.date = searchTerm;

      // If ALL, omit day_type to include everything
      if (selectedDayType !== 'ALL') {
        params.day_type = selectedDayType; // one of SU, TH, OT
      }

      const { data } = await axios.get(PLANS_CHOICES_URL, { params });
      setPlans(data.results || []);
      setCount(data.count || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('There was an error fetching the plans!', error);
      setPlans([]);
      setCount(0);
    }
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const handleDayTypeChange = (e) => {
    setSelectedDayType(e.target.value); // 'ALL' | 'SU' | 'TH' | 'OT'
  };

  const monthNames = [
    'Հունվար', 'Փետրվար', 'Մարտ', 'Ապրիլ', 'Մայիս', 'Հունիս',
    'Հուլիս', 'Օգոստոս', 'Սեպտեմբեր', 'Հոկտեմբեր', 'Նոյեմբեր', 'Դեկտեմբեր'
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber !== currentPage) fetchPage(pageNumber);
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className="plan-list-container">
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

      <h1 className="song-title">Ծրագրեր</h1>

      <input
        type="date"
        placeholder="Search by date"
        value={searchTerm}
        onChange={handleSearch}
        className="search-input"
      />

      {/* Single-select filters (radio-like) */}
      <div className="filters">
        <label>
          <input
            type="radio"
            name="dayType"
            value="ALL"
            checked={selectedDayType === 'ALL'}
            onChange={handleDayTypeChange}
          />
          <span>Բոլորը</span>
        </label>
        <label>
          <input
            type="radio"
            name="dayType"
            value="SU"
            checked={selectedDayType === 'SU'}
            onChange={handleDayTypeChange}
          />
          <span>Կիրակի</span>
        </label>
        <label>
          <input
            type="radio"
            name="dayType"
            value="TH"
            checked={selectedDayType === 'TH'}
            onChange={handleDayTypeChange}
          />
          <span>Հինգշաբթի</span>
        </label>
        <label>
          <input
            type="radio"
            name="dayType"
            value="OT"
            checked={selectedDayType === 'OT'}
            onChange={handleDayTypeChange}
          />
          <span>Այլ</span>
        </label>
      </div>

      <ul className="plan-list">
        {plans.map((plan) => (
          <li key={plan.id} className="plan-item">
            <Link to={`/plans/${plan.id}`} className="plan-link">
              {formatDate(plan.date)}
            </Link>
          </li>
        ))}
      </ul>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages || 1}
        onPageChange={handlePageChange}
        siblingCount={1}
        boundaryCount={1}
      />
    </div>
  );
};

export default PlanList;
