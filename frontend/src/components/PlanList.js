import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './PlanList.css';
import logo from './logo.png'; // Ensure you have a logo.png file in the appropriate directory

const PlanList = () => {
  const [plans, setPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // YYYY-MM-DD from <input type="date">
  const [menuOpen, setMenuOpen] = useState(false);
  const [dayTypeFilter, setDayTypeFilter] = useState({
    ALL: true, TH: false, SU: false, OT: false,
  });

  // server-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const plansPerPage = 15; // keep your UI page size
  const [count, setCount] = useState(0); // total items on server
  const totalPages = Math.ceil(count / plansPerPage);

  useEffect(() => {
    fetchPage(1); // initial load
  }, []);

  // refetch when search term changes (debounced)
  useEffect(() => {
    const t = setTimeout(() => fetchPage(1), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // refetch when day type filter changes
  useEffect(() => {
    fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayTypeFilter.TH, dayTypeFilter.SU, dayTypeFilter.OT, dayTypeFilter.ALL]);

  const fetchPage = async (page) => {
    try {
      const params = {
        page,
        page_size: plansPerPage,
        ordering: '-date', // newest first
      };

      // exact date filter if provided (YYYY-MM-DD)
      if (searchTerm) {
        params.date = searchTerm;
      }

      // day_type filter (comma-separated SU,TH,OT) unless "ALL"
      const selected = ['TH', 'SU', 'OT'].filter(k => dayTypeFilter[k]);
      if (!dayTypeFilter.ALL && selected.length > 0 && selected.length < 3) {
        params.day_type = selected.join(',');
      }
      // If ALL or all three are selected, omit param to include everything

      const { data } = await axios.get('https://emmanuel-worship-backend.onrender.com/api/plans/', { params });
      setPlans(data.results || []);
      setCount(data.count || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('There was an error fetching the plans!', error);
      setPlans([]);
      setCount(0);
    }
  };

  const handleSearch = event => {
    setSearchTerm(event.target.value);
  };

  const handleDayTypeChange = event => {
    const { name, checked } = event.target;
    if (name === "ALL") {
      setDayTypeFilter({
        ALL: checked,
        TH: checked,
        SU: checked,
        OT: checked,
      });
    } else {
      setDayTypeFilter(prevFilter => {
        const updatedFilter = { ...prevFilter, [name]: checked, ALL: false };
        if (updatedFilter.TH && updatedFilter.SU && updatedFilter.OT) {
          updatedFilter.ALL = true;
        }
        return updatedFilter;
      });
    }
  };

  const monthNames = [
    'Հունվար', 'Փետրվար', 'Մարտ', 'Ապրիլ', 'Մայիս', 'Հունիս',
    'Հուլիս', 'Օգոստոս', 'Սեպտեմբեր', 'Հոկտեմբեր', 'Նոյեմբեր', 'Դեկտեմբեր'
  ];

  const formatDate = dateString => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber !== currentPage) {
      fetchPage(pageNumber);
    }
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

      <h1 className="title">Ծրագրեր</h1>

      <input
        type="date"
        placeholder="Search by date"
        value={searchTerm}
        onChange={handleSearch}
        className="search-input"
      />

      <div className="filters">
        <label>
          <input
            type="checkbox"
            name="ALL"
            checked={dayTypeFilter.ALL}
            onChange={handleDayTypeChange}
          />
          Բոլորը
        </label>
        <label>
          <input
            type="checkbox"
            name="SU"
            checked={dayTypeFilter.SU}
            onChange={handleDayTypeChange}
          />
          Կիրակի
        </label>
        <label>
          <input
            type="checkbox"
            name="TH"
            checked={dayTypeFilter.TH}
            onChange={handleDayTypeChange}
          />
          Հինգշաբթի
        </label>
        <label>
          <input
            type="checkbox"
            name="OT"
            checked={dayTypeFilter.OT}
            onChange={handleDayTypeChange}
          />
          Այլ
        </label>
      </div>

      <ul className="plan-list">
        {plans.map(plan => (
          <li key={plan.id} className="plan-item">
            <Link to={`/plans/${plan.id}`} className="plan-link">
              {formatDate(plan.date)}
            </Link>
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

export default PlanList;